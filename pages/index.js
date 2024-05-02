import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '../components/loader'
import styles from '../styles/index.module.css'
import { useRouter } from 'next/router'

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
        <div className={styles.container}>
            <Head>
                <title>Verifier App Demo</title>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Credential Verification</h1>

                <div className={styles.loaderContainer}>
                    {status === NON_STARTED && (
                        <button className={styles.button} onClick={onClickMdl}>
                            Start MDL Presentation Flow
                        </button>
                    )}
                </div>

                {status === MDL_WAITING && (
                    <p>
                        Click{' '}
                        <a href={url} rel="noreferrer">
                            HERE
                        </a>{' '}
                        to open wallet and preset your MDL credential
                    </p>
                )}

                {status === MDL_FETCHING && <div />}

                {status === MDL_VERIFIED && (
                    <button className={styles.button} onClick={onClickVP}>
                        Start VC Presentation Flow
                    </button>
                )}

                {status === VP_WAITING && (
                    <div>
                        <p>
                            Click{' '}
                            <a href={url} rel="noreferrer" target="_blank">
                                HERE
                            </a>{' '}
                            to open wallet and preset your VC credential
                        </p>
                        <Loader />
                    </div>
                )}

                {status === VP_VERIFIED && <p> All Done</p>}

                {status !== NON_STARTED && (
                    <button className={styles.reset} onClick={reset}>
                        Reset
                    </button>
                )}
            </main>
        </div>
    )
}
