import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '../components/loader'
import styles from '../styles/index.module.css'
import { useRouter } from 'next/router'
import { cn } from '../utils/cn'
import Image from 'next/image'
import {MdlCard} from "../components/mdlCard";
import {VpCard} from "../components/vpCard";

const NON_STARTED = 'non_started'
const MDL_WAITING = 'mdl_waiting'
const MDL_FETCHING = 'mdl_fetching'
const MDL_VERIFIED = 'mdl_verified'
const VP_WAITING = 'vp_waiting'
const VP_VERIFIED = 'vp_verified'

export default function Home() {
    const [presentationVP, setPresentationVP] = useState()
    const [presentationMDL, setPresentationMDL] = useState()

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
                'flex h-screen w-full flex-col items-center justify-center',
                'bg-stone-50',
                'dark:bg-stone-950'
            )}
        >
            <Head>
                <title>Verifier App Demo</title>
            </Head>

            <main
                className={cn(
                    'flex h-[720px] w-full max-w-md flex-col items-center justify-between gap-10 px-10 py-20 pb-10',
                    'rounded-[40px] border border-stone-200 bg-white shadow-xl'
                )}
            >
                <h1 className="w-full text-center text-3xl font-bold text-stone-900">
                    Credential Verification
                </h1>

                <div className="w-full">
                    {presentationMDL && (MdlCard(presentationMDL.presentation))}
                </div>

                <div className="w-full">
                    {presentationVP && (VpCard(presentationVP.verifiableCredential[0]))}
                </div>

                <div className="flex w-full flex-col gap-4">
                    <div className="flex h-24 flex-col text-stone-500">
                        {status === MDL_WAITING && (
                            <p className="text-center">
                                <a
                                    className={cn(
                                        'mr-1 rounded-lg px-1 py-1 font-semibold text-indigo-500',
                                        'hover:text-indigo-700',
                                        'focus-within:shadow-button-focus'
                                    )}
                                    href={url}
                                    rel="noreferrer"
                                >
                                    Click here
                                </a>
                                to open wallet and preset your MDL credential
                            </p>
                        )}

                        {status === MDL_FETCHING && <div/>}

                        {status === VP_WAITING && (
                            <div>
                                <p className="text-center">
                                    <a
                                        className={cn(
                                            'mr-0.5 font-semibold text-indigo-500',
                                            'hover:text-indigo-700'
                                        )}
                                        href={url}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        Click here
                                    </a>{' '}
                                    to open wallet and preset your VC credential
                                </p>
                                <Loader/>
                            </div>
                        )}

                        {status === VP_VERIFIED && (
                            <p className="text-center text-sm">All Done</p>
                        )}
                    </div>

                    <div className="flex h-24 flex-col justify-end gap-2">
                        {status === NON_STARTED && (
                            <button
                                className={cn(
                                    'shadow-button w-full cursor-pointer rounded-2xl bg-indigo-500 px-8 py-4 text-sm font-semibold text-white',
                                    'hover:bg-indigo-600',
                                    'focus-within:shadow-button-focus',
                                    'transition-all duration-150 ease-out'
                                )}
                                onClick={onClickMdl}
                            >
                                Start MDL Presentation Flow
                            </button>
                        )}
                        {status === MDL_VERIFIED && (
                            <button
                                className={cn(
                                    'shadow-button w-full cursor-pointer rounded-2xl bg-indigo-500 px-8 py-4 text-sm font-semibold text-white',
                                    'hover:bg-indigo-600',
                                    'focus-within:shadow-button-focus',
                                    'transition-all duration-150 ease-out'
                                )}
                                onClick={onClickVP}
                            >
                                Start VC Presentation Flow
                            </button>
                        )}
                        {status !== NON_STARTED && (
                            <button
                                className={cn(
                                    'w-full cursor-pointer rounded-2xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 shadow-sm outline-none',
                                    'hover:bg-stone-50',
                                    'focus-within:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]',
                                    'transition-all duration-150 ease-in-out'
                                )}
                                onClick={reset}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
