# url
https://openquest.xyz/quest/solana-messaging-app

このリンク先に沿ってやる。
- 環境をととのえる
- solana-test-validatorを実行する
- airdropしてamountを増やす
    - amountを使用して、データをaccountに保存する。
    - rentとして支払う
- programを書く。programはaccountにデータを保存したりする。
    - smart contract。
        - ある条件が整ったら、処理を実行する。
- anchor deploy
    - programをデプロイする
- testを実行する
    - 初期化と上書きをテストする

# test
1. ctrl+c to exit solana-test-validator

2. BROWSER= anchor test

# Error
> Error: Provider env is not available on browser.

failed
anchor test

success
BROWSER= anchor test

https://github.com/project-serum/anchor/issues/1145#issuecomment-1008227810
