import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '../components/loader'
import { useRouter } from 'next/router'
import { cn } from '../utils/cn'
import Image from 'next/image'
import { MdlCard } from '../components/mdlCard'
import { VpCard } from '../components/vpCard'
import { AnimatePresence, motion } from 'framer-motion'

const NON_STARTED = 'non_started'
const MDL_WAITING = 'mdl_waiting'
const MDL_FETCHING = 'mdl_fetching'
const MDL_VERIFIED = 'mdl_verified'
const VP_WAITING = 'vp_waiting'
const VP_VERIFIED = 'vp_verified'

export default function Home() {
    const [presentationVP, setPresentationVP] = useState()
    const [presentationMDL, setPresentationMDL] = useState()

    const [loading, setLoading] = useState(true)

    const [status, setStatus] = useState(NON_STARTED)
    const [url, setUrl] = useState('')

    const timerRef = useRef(null)
    const router = useRouter()

    // Step 2, check the backed if we received a presentation
    const pollForPresentation = useCallback(async (request_id) => {
        try {
            const res = await fetch(`/api/verify/check_vp`, {
                method: 'post',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id,
                }),
            })
            const data = await res.json()

            // presentation is received and verified
            if (data.status === 'verified') {
                return data
            } else {
                // other statuses, like 'initiated', which means the user
                // started the process
                // pause for a bit
                await new Promise((resolve) => {
                    timerRef.current = setTimeout(resolve, 1000)
                })

                // then recheck
                return pollForPresentation(request_id)
            }
        } catch (err) {
            console.log('Error during check:', err)
        }
    }, [])

    useEffect(() => {
        async function fetchMdlResult(responseCode) {
            const res = await fetch(`/api/verify/fetch_mdl`, {
                method: 'post',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response_code: responseCode,
                }),
            })

            const data = await res.json()
            setPresentationMDL(data)
            setStatus(MDL_VERIFIED)
        }

        const hash = router.asPath.split('#')[1]
        const parsedHash = new URLSearchParams(hash)
        const responseCode = parsedHash.get('response_code')

        if (responseCode) {
            setStatus(MDL_FETCHING)
            router.push('/')
            fetchMdlResult(responseCode)
        }
    }, [])

    const onClickVP = useCallback(async () => {
        try {
            const res = await fetch(`/api/verify/start_vp`)
            const { url, request_id } = await res.json()
            // walletUrl would normally be encoded into a QR code that a user
            // would scan with the wallet app.
            const walletUrl = url.replace(
                'openid-vc://',
                'https://wallet.verifiablecredentials.dev/siop'
            )
            setUrl(walletUrl)

            // Start polling for a result. This happens once the user
            // follows the walletUrl link and presents a credential from ID Wallet
            setStatus(VP_WAITING)
            const { presentation } = await pollForPresentation(request_id)
            presentation.verifiableCredential =
                presentation.verifiableCredential.map(parseJwt)
            setPresentationVP(presentation)
            setStatus(VP_VERIFIED)
            console.log(JSON.stringify(presentation, null, 2))
        } catch (err) {
            console.log(err)
        }
    }, [pollForPresentation])

    const onClickMdl = async (event) => {
        event.preventDefault()
        setStatus(MDL_WAITING)
        try {
            // Step 1, start the presentation flow
            const res = await fetch(`/api/verify/start_mdl`)
            const { url } = await res.json()
            const walletUrl = url.replace(
                'mdoc-openid4vp://',
                'https://wallet.verifiablecredentials.dev/mdl/request'
            )
            setUrl(walletUrl)
        } catch (err) {
            console.log(err)
        }
    }

    const reset = () => {
        // RemoveFragment
        setStatus(NON_STARTED)
        setPresentationMDL()
        setPresentationVP()
        setUrl('')
    }

    const parseJwt = (token) => {
        if (!token) {
            return
        }
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse(window.atob(base64))
    }

    return (
        <div
            className={cn(
                'h-screen w-full flex-col',
                'bg-white text-neutral-700'
            )}
        >
            <Head>
                <title>Verifier App Demo</title>
            </Head>

            <header
                className={cn(
                    'z-10 flex w-full flex-col justify-center border-b-[5px] border-[#FDB81E] bg-white'
                )}
            >
                <div className="flex h-14 items-center justify-center bg-[#046B99] px-10">
                    <div className="w-full max-w-6xl">
                        <Image
                            alt="CA"
                            onLoadingComplete={() => setLoading(false)}
                            className={cn(
                                'w-12',
                                loading && 'scale-50 blur-xl'
                            )}
                            src="/assets/logo-top.png"
                            width={200}
                            height={80}
                        />
                    </div>
                </div>
                <div className="flex h-20 items-center justify-center px-10">
                    <div className="w-full max-w-6xl">
                        <Image
                            alt="Edu"
                            onLoadingComplete={() => setLoading(false)}
                            className={cn(
                                'w-40',
                                loading && 'scale-50 blur-xl'
                            )}
                            src="/assets/logo-main.png"
                            width={200}
                            height={80}
                        />
                    </div>
                </div>
            </header>

            <main className="flex h-screen w-full items-start justify-center">
                <AnimatePresence mode="wait">
                    <div
                        className={cn(
                            'flex h-[720px] w-full max-w-md flex-col items-center gap-10 px-10 py-20 pb-10'
                        )}
                    >
                        <h1 className="serif w-full text-center text-3xl font-semibold text-stone-900">
                            Credential Verification
                        </h1>

                        <motion.div
                            layout
                            initial={{
                                y: 50,
                                rotate: 7.5,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                rotate: 0,
                                opacity: 1,
                            }}
                            exit={{
                                y: 50,
                                opacity: 0,
                                rotate: -7.5,
                            }}
                            transition={{
                                duration: 0.35,
                                type: 'spring',
                                bounce: 0.5,
                            }}
                            className={cn(
                                'flex h-56 w-full flex-col gap-4 rounded-[26px] border-8 border-black/20 bg-stone-100 p-5 shadow-xl backdrop-blur-2xl',
                                presentationVP && 'h-full'
                            )}
                        >
                            {presentationMDL &&
                                MdlCard(presentationMDL.presentation)}

                            {presentationVP && (
                                <>
                                    <hr className="h-0.5 w-full bg-stone-200" />
                                    {VpCard(
                                        presentationVP.verifiableCredential[0]
                                    )}
                                </>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex w-full flex-col gap-4"
                        >
                            {status === MDL_WAITING && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center text-neutral-700"
                                >
                                    <a
                                        className={cn(
                                            'mr-1 rounded-lg px-1 py-1 font-semibold text-[#046B99]',
                                            'hover:text-[#046B99]/90',
                                            'focus-within:shadow-button-focus'
                                        )}
                                        href={url}
                                        rel="noreferrer"
                                    >
                                        Click here
                                    </a>
                                    to open wallet and preset your MDL
                                    credential
                                </motion.p>
                            )}

                            {status === MDL_FETCHING && <div />}

                            {status === VP_WAITING && (
                                <motion.div className="flex flex-col items-center gap-4">
                                    <p className="text-center text-neutral-700">
                                        <a
                                            className={cn(
                                                'mr-0.5 font-semibold text-[#046B99]',
                                                'hover:text-[#046B99]/90'
                                            )}
                                            href={url}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Click here
                                        </a>{' '}
                                        to open wallet and preset your VC
                                        credential
                                    </p>
                                    <Loader />
                                </motion.div>
                            )}

                            {status === VP_VERIFIED && (
                                <motion.div className="flex flex-col items-center gap-2 font-semibold text-green-700">
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 60 60"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M59.3332 30C59.3332 46.2004 46.2002 59.3334 29.9998 59.3334C13.7995 59.3334 0.666504 46.2004 0.666504 30C0.666504 13.7997 13.7995 0.666687 29.9998 0.666687C46.2002 0.666687 59.3332 13.7997 59.3332 30ZM19.124 27.8857L26.6665 35.4282L41.7514 20.3432L45.5227 24.1145L29.4949 40.1422C27.9328 41.7043 25.4002 41.7043 23.8381 40.1422L15.3528 31.6569L19.124 27.8857Z"
                                            fill="#047857"
                                        />
                                    </svg>

                                    <motion.p className="text-center text-sm">
                                        All Done
                                    </motion.p>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex h-24 flex-col justify-end gap-2"
                                >
                                    {status === NON_STARTED && (
                                        <motion.button
                                            className={cn(
                                                'w-full cursor-pointer rounded-2xl bg-[#046B99] px-8 py-4 text-sm font-semibold text-white shadow-button',
                                                'hover:bg-[#046B99]/90',
                                                'focus-within:shadow-button-focus',
                                                'transition-all duration-150 ease-out'
                                            )}
                                            onClick={onClickMdl}
                                        >
                                            Start MDL Presentation Flow
                                        </motion.button>
                                    )}
                                    {status === MDL_VERIFIED && (
                                        <motion.button
                                            className={cn(
                                                'w-full cursor-pointer rounded-2xl bg-[#046B99] px-8 py-4 text-sm font-semibold text-white shadow-button',
                                                'hover:bg-[#046B99]/90',
                                                'focus-within:shadow-button-focus',
                                                'transition-all duration-150 ease-out'
                                            )}
                                            onClick={onClickVP}
                                        >
                                            Start VC Presentation Flow
                                        </motion.button>
                                    )}
                                    {status !== NON_STARTED && (
                                        <motion.button
                                            className={cn(
                                                'w-full cursor-pointer rounded-2xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 shadow-sm outline-none',
                                                'hover:bg-stone-50',
                                                'focus-within:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]',
                                                'transition-all duration-150 ease-in-out'
                                            )}
                                            onClick={reset}
                                        >
                                            Reset
                                        </motion.button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </AnimatePresence>
            </main>
        </div>
    )
}
