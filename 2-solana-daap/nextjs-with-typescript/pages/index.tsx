import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction , PublicKey, Connection } from '@solana/web3.js';
import React, { FC, useEffect, useState } from 'react';
import {
  Program, web3, AnchorProvider, BN
} from '@project-serum/anchor';
import idl from '../../solana-twitter/target/idl/solana_twitter.json'
import { SolanaTwitter } from "../../solana-twitter/target/types/solana_twitter";
import { Env, getEnv } from '../src/network';
import { failure, Result, success, SystemError, UserError } from '../src/result';
import { Snackbar } from '@mui/material';

const programID = new PublicKey(idl.metadata.address)

const useEnv = () => {
  const [env, setEnv] = useState<Result<Env, SystemError>>()
  useEffect(()=> {
    const env = getEnv()
    setEnv(env)
  }, [])
  return env
}

type Tweet = {
  publicKey: string;
  author: string;
  content: string;
  timestamp: string;
  topic: string; 
}

const adjustTweet = (tweet: {
  publicKey: PublicKey
  author: PublicKey
  timestamp: BN
  content: string
  topic: string
}): Tweet => ({
  publicKey: tweet.publicKey.toBase58(),
  author: tweet.author.toBase58(),
  content: tweet.content,
  timestamp: tweet.timestamp.toString(),
  topic: tweet.topic,
})

const getProvider = async (env: Env, wallet: WalletContextState): Promise<Result<AnchorProvider, SystemError>> => {
  const opts = AnchorProvider.defaultOptions();
  const connection = new Connection(
    env.connectionEndpoint,
    opts.preflightCommitment
  );
  if (wallet.wallet === null || wallet.publicKey === null) return failure({
    type: 'system',
    message: 'No wallet',
    data: {
      wallet,
    }
  })
  const signTransaction = async (tx: Transaction): Promise<Transaction> => {
    const a = wallet.signTransaction && wallet.signTransaction(tx)
    if (a === undefined) throw Error()
    return a
  }
  const signAllTransactions = async (txs: Transaction[]): Promise<Transaction[]> => {
    const a = wallet.signAllTransactions && wallet.signAllTransactions(txs)
    if (a === undefined) throw Error()
    return a
  }

  try {
    return success(new AnchorProvider(connection, {
      publicKey: wallet.publicKey,
      signTransaction,
      signAllTransactions,
    }, opts))
  } catch (err) {
    return failure({
      type: 'system',
      message: 'Failed to get provider',
      data: {
        err,
        wallet,
        opts,
        connection,
      }
    })
  }
}

const getTweets = async (env: Env, wallet: WalletContextState): Promise<Result<Tweet[], SystemError>> => {
  const provider = await getProvider(env, wallet)
  if (provider.isFailure) {
    return failure(provider.value)
  }
  const program = new Program<SolanaTwitter>(idl as any as SolanaTwitter, programID, provider.value)
  return success(await (await program.account.tweet.all()).map(tweet => adjustTweet({
    publicKey: tweet.publicKey,
    ...tweet.account,
  })))
}

const setTweet = async (env: Env, wallet: WalletContextState): Promise<Result<Tweet, UserError|SystemError>> => {
  const provider = await getProvider(env, wallet)
  if (provider.isFailure) {
    return failure(provider.value)
  }
  const program = new Program<SolanaTwitter>(idl as any as SolanaTwitter, programID, provider.value)
  const tweet = web3.Keypair.generate()
  if (wallet.publicKey === null) return failure({
    message: 'No wallet',
    type:"user",
    data: {
      "wallet.publicKey": wallet.publicKey
    }
  })

  try {
    await program.methods.sendTweet('veganism', 'Hummus, am I right?')
      .accounts({
        author: wallet.publicKey,
        tweet: tweet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey)
    return success(adjustTweet({
      publicKey: tweet.publicKey,
      ...tweetAccount,
    }))
  } catch (err) {
    return failure({
      type: 'user',
      message: 'Failed to send tweet',
      data: {
        env,
        wallet,
        provider,
        program,
        tweet,
      }
    })
  }
}

const SendOneLamportToRandomAddress: FC = () => {
  const [open, setOpen]= useState(false)
  const [message, setMessage]=useState('')
  const wallet = useWallet();
  const [tweets, setTweets] = React.useState<{
    publicKey: string;
    author: string;
    content: string;
    timestamp: string;
    topic: string;
  }[]>([]);
  const env = useEnv()
  useEffect(() => {
    (async () => {
      if (env === undefined) {
        setMessage('envのローディング中')
        setOpen(true)
        return
      }
      if (env.isFailure) {
        setMessage('envの読み込みに失敗しました')
        setOpen(true)
        return
      }

      const tweets = await getTweets(env.value, wallet)
      if (tweets.isFailure) {
        setMessage('tweetsの取得に失敗しました')
        setOpen(true)
        return
      }
      setMessage('tweetsの取得に成功しました')
      setOpen(true)
      setTweets(tweets.value)
    })()
  }, [wallet, env])
  
  if (env === undefined) return (
    <div>
      env Loading...
      <Snackbar open={open}>
        <div>{message}</div>
      </Snackbar>
    </div>
  )

  if (env.isFailure) {
    console.error(env.value)
    return <div>
      system error
      <Snackbar open={open}>
        <div>{message}</div>
      </Snackbar>
    </div>
  }
  
  if (tweets.length === 0) return(
    <div>
      tweetがまだありません
      <Snackbar open={open}>
        <div>{message}</div>
      </Snackbar>
    </div>
  )

  const onClick = async () => {
    const tweet = await setTweet(env.value, wallet)
    if (tweet.isFailure) {
      if (tweet.value.type === 'user') {
        setMessage('tweetの設定に失敗しました。walletが見つかりません。')
        setOpen(true)
        console.error(tweet.value)
        return
      }
      setMessage('tweetの設定に失敗しました。システムのエラーです。')
      setOpen(true)
      console.error(tweet.value)
      return
    }
    setMessage('tweetの設定に成功しました。')
    setOpen(true)
    setTweets([...tweets, tweet.value])
  };

  return (
    <>
      {tweets.map(tweet => <div key={tweet.publicKey}>
        <div>author: {tweet.author}</div>
        <div>content: {tweet.content}</div>
        <div>publicKey: {tweet.publicKey}</div>
        <div>timestamp: {tweet.timestamp}</div>
        <div>topic: {tweet.topic}</div>
      </div>)}
      <button onClick={onClick} disabled={!wallet.publicKey}>
        setTweet
      </button>
      <Snackbar open={open}>
        <div>{message}</div>
      </Snackbar>
    </>
  );
};

export default SendOneLamportToRandomAddress