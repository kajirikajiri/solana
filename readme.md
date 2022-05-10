1によって、programが作成できた。
思ったより、[これ](https://figmentnetw-learnweb3da-0l4chjyzm0x.ws-us44.gitpod.io/)が面倒なことをしていたので、ローカルで動かして、いるところだけ持ってくる

これを作成してdevnetにあげれば？と思ったが、devnetへdeployする方法が不明。
https://github.com/kajirikajiri/learn-web3-dapp
solana config set --url devnet を実行して、なんかやれば？と思ったがいまいちうまくいかなかったので他のやつ探す

devnetに上げてるね？これやろう
https://lorisleiva.com/create-a-solana-dapp-from-scratch

solanaのrentは２年分を払うと以降の支払いを免除
２年ごとにcpuが半額になるみたいな定理に基づいている。
あと、２年分も取れば十分だろみたいな。
ただ、それを求めるのに、programの容量で見積もってるようなので、最初のデプロイを超軽量にすれば、2年分の家賃は低く抑えられると思われる。
が、将来可変のrentになるっぽいのでそこらへんも加味するとどうなるか不明。
そしてまだbeta。

前回、devnetに上げることに成功した。
これ以降の方向性に迷う。
が、まあdevnetは無料だし、無料のdatabaseとして便利そうでは？
まあ、devnetなんで消える可能性はあるっぽいが。

他のプロダクトもおそらくdevnetに上げてテストした上でmainnetに上げるだろう。
もしくはmainnetを二つ？でもリアルマネーが必要なのでそれはしないでしょう。
他のプロダクトもみたいな。