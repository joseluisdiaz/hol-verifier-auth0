import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import styles from '../styles/index.module.css'

export default function Mdl_result() {
    const { asPath } = useRouter()
    const [mdlResults, setMdlResults] = useState(undefined)

    useEffect(() => {
        async function fetchResult(code) {
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

            setMdlResults(data)
        }
        const hash = asPath.split('#')[1]
        const parsedHash = new URLSearchParams(hash)
        const responseCode = parsedHash.get('response_code')
        if (responseCode) {
            fetchResult(responseCode)
        }
    }, [asPath])

    return (
        <div>
            <Head>
                <title>MDL Results</title>
            </Head>
            <h1>MDL Results</h1>

            <div>
                <div className={styles.presentation}>
                    <pre className={styles.jwt}>
                        {JSON.stringify(mdlResults, null, 4)}{' '}
                    </pre>
                </div>
            </div>
        </div>
    )
}
