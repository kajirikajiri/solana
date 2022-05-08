import { failure, Result, success, SystemError } from "./result"

export const NETWORK = {
    devnet: "devnet",
    localhost: "localhost",
} as const

export type Env = {
    connectionEndpoint: string
}

type ENV = {
    [key in keyof typeof NETWORK]: Env
}

const ENV: ENV = {
    devnet: {
        connectionEndpoint: "http://localhost:8899",
    },
    localhost: {
        connectionEndpoint: "https://api.devnet.solana.com"
    }
}

const getCurrentNetwork = (): Result<keyof typeof NETWORK,SystemError> => {
    const network = process.env.NEXT_PUBLIC_ACTIVE_NETWORK
    if (network === NETWORK.devnet) return success(network)
    if (network === NETWORK.localhost) return success(network)
    return failure({
        type: 'system',
        message: 'Unknown network',
        data: {
            "process.env.NEXT_PUBLIC_ACTIVE_NETWORK": process.env.NEXT_PUBLIC_ACTIVE_NETWORK
        }
    })
}

export const getEnv = (): Result<Env, SystemError> => {
    const result = getCurrentNetwork()
    if (result.isFailure) {
        return failure(result.value)
    }
    return success(ENV[result.value])
}
