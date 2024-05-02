import fetch from 'node-fetch'
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_SECRET = process.env.AUTH0_SECRET

if (!AUTH0_DOMAIN) throw new Error('AUTH0_DOMAIN not set')
if (!AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID not set')
if (!AUTH0_SECRET) throw new Error('AUTH0_SECRET not set')

export default async function handler(req, res) {
    try {
        const id = req.body.response_code
        const result = await run(id)
        res.status(200).json(result)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
}

async function run(id) {
    if (!id) throw new Error('request_id not found')

    const result = await fetch(
        `https://${AUTH0_DOMAIN}/vcs/presentation-request/result`,
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: AUTH0_CLIENT_ID,
                client_secret: AUTH0_SECRET,
                response_code: id,
            }),
        }
    )

    const data = await result.json()

    return data
}
