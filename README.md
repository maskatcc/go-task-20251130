# Taskサンプル

これはタスクランナー [Task](https://taskfile.dev/) の評価用サンプルプロジェクトです

## 主な対象ユーザー

- TypeScript を使って、Lambda 環境でサーバーレス開発をおこなっている開発チーム
- Windows や MacOS など、プラットフォームが混在する開発チーム

## 背景と目的

サーバーレスな Lambda 開発において、

- zip にパッケージ化して、
- S3 にアップロードして、
- Lambda 関数に反映して、

実行する

関数内でエラーが発生した場合は、

- CloudWatch コンソールを開いて、
- キーワードで検索して、
- ヒットしたログを１つずつ確認しながら、

調査する

こんなやり方を繰り返していては、開発効率は上がらない

よりよい開発手法を探していたが、ちょうど良いものが見つからない  
[AWS SAM](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/what-is-sam.html) や [Serverless Framework](https://www.serverless.com/) の有名どころを試してみたけど、どれもしっくりこない（ついでに[LocakStack](https://www.localstack.cloud/)も微妙）  
どれも環境が大掛かりで、ハマればとても役に立つけど、柔軟性に欠ける印象が強い  
もっと使い勝手のよい方法はないかと模索しているとき、タスクランナー [Task](https://taskfile.dev/) の存在を知り、これならいけるかも？と思い、実験・評価してみることにした

### 他の選択肢

#### npm

言わずと知れた Node.js のパッケージマネージャー  
これだけで、依存パッケージの管理や、タスクランナーの役割をこなす頼もしい存在

ただ、タスクランナーとしての機能は正直なところ微妙...  
npm の機能を知らないだけの可能性は高いけど、package.json の scripts にコマンドをワンライナーで書くのは無理があるよね...  

#### GNU Make

ビルドランナーとして [make](https://www.gnu.org/software/make/) が有名で、実績は十分、[npm](https://www.npmjs.com/) とも相性がよいとの記事をいくつか見たので調べてみた

ほどなくして、残念ながら Windows ではほとんど使えないと分かり断念  
make を調べる中で、make派と Task派 の存在を知り、Task に興味を持つようになった

### プラットフォーム中立

[Task](https://taskfile.dev/) は、Mac や Linux はもちろん、Windows 環境でも sh スクリプトを書ける  
Mac 環境で書いた bash スクリプトを、Windows 環境向けに PowerShell に移植する必要はない

これまでわたしは Windows 環境での開発が中心だった  
それでも、PowerShell スクリプトはクセが強くて覚えられず、なるべく bash 互換のコマンドしか使わない  
なので Windows で bash が動くという特徴は、とても都合が良く、チーム開発にも向いている

そして [Task](https://taskfile.dev/) は、任意のスクリプト言語の組み合わせることができる  
その筆頭候補は bash 等のシェルスクリプトだけど、他の選択肢として Node.js があり、これはプラットフォームを選ばない  
さらに Node.js には、[TypeScript](https://www.typescriptlang.org/) を明示的なビルド（トランスパイル）なしで実行できる [tsx](https://www.npmjs.com/package/tsx) がある  
これらを踏まえると、Node.js におけるタスク実行環境の理想形が見えてくる  

すなわち、以下の TaskFile がタスク実行の１つの理想では？と考えてる

```yml
tasks:
  task-sh:
    cmds:
      - sh: ls -al

  task-ts:
    cmds:
      - npx tsx task.ts
```

このコマンドを実行するには、任意のシェルで以下のように呼び出す  

```sh
# global installed env
task task-sh
task task-ts

# project local installed env
npx task task-sh
npx task task-ts
```

呼び出し方は、MacOS や Linux でも、そして Windows でも変わらない  
もちろんどこでも動く

この Task + Node.js + tsx + TypeScript のコンボは非常に強力で、

- 汎用性・拡張性が極めて高く、
- プラットフォーム中立で、
- （Node.js環境があれば）どこでも動作する

隙のない、無敵の組み合わせだと考えている

※タスク用のスクリプトはもっと気軽に書きたいなら TypeScript を使わず、Task + Node.js (JavaScript) でもいいと思う

## 評価サンプル

AWS Lambda 向けのサーバーレス開発環境を想定する  
ローカル開発環境で [Task](https://taskfile.dev/) を使い、開発効率を底上げできるかを評価する

実装したコマンドの一覧は以下のとおりで、[AWS SAM](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/what-is-sam.html) を参考にしつつ、Lambda関数に必要となる必須コマンドを揃えてみた

```cmd
❯ npx task --list
task: Available tasks for this project:
* build-all:              build all funcs.
* clean-all:              clean up all artifacts.
* default:                build all funcs.
* deploy-all:             deploy all funcs in Lambda.
* install-deps:           install depending npm packages
* package-all:            package all funcs.
* rebuild-all:            rebuild all funcs.
* sdk:                    aws sdk test.
* upload-all:             upload all funcs to S3.
* build:*:                build specific func (* is func name).
* clean:*:                clean up artifact for specific func (* is func name).
* deploy:*:               deploy specific func (* is func name).
* package:*:              package specific func (* is func name).
* rebuild:*:              rebuild specific func (* is func name).
* sync-from-code:*:       lambda sync code's sha256 from lambda to local (* is func name).
* sync-from-repo:*:       s3 sync checksum from func package repository to local (* is func name).
* upload:*:               upload specific func (* is func name).
```

例えば、func1 をビルドしてバンドル化すなら次のコマンドを実行する

```pwsh
npx task build:func1
```

必要なら `npm install` を実行し、[esbuild](https://esbuild.github.io/) により JavaScript コードをバンドル化する

```pwsh
❯ npx task build:func1
task: [install-deps] npm install

up to date, audited 337 packages in 798ms

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
task: [install-deps] touch node_modules/.installed
task: [build:func1] npx tsx src/tasks/build.ts func1
build for func: src\funcs\func1\index.ts
build successful!
```

すにで最新ソースでビルド済みであれば、無駄な実行は賢くスキップしてくれる

```pwsh
❯ npx task build:func1
task: Task "install-deps" is up to date
task: Task "build:func1" is up to date
```

実際には明示的にビルドコマンドを実行しなくても、Lambda へのデプロイをコマンド実行すればOKで、必要に応じてビルドしてくれる

これはビルドに限りず、zip パッケージや S3 アップロードも同様で、しかもそれぞれのコマンドで無駄な実行はスキップしてくれる  
これがタスクランナーとしての特徴であり、おそらく最大のメリットだと思う  
タスク同士の依存関係や、タスクごとの入出力ファイルをシンプルな形で定義することで、全体としては複雑になる複合タスクを、とてもスマートに実行してくれる

> [!important]
> リリースバージョンとしてLambda関数をデプロイするための構築コードや環境・手順は、別途、用意する必要がある  
> 構築コードには [Terraform](https://developer.hashicorp.com/terraform) や [AWS CloudFormation](https://aws.amazon.com/jp/cloudformation/) を使い、その実環境には [GitHub Actions](https://github.co.jp/features/actions) 等を利用するのが最近では一般的かと思う  
> 今回評価している [Task](https://taskfile.dev/) は、リリースに至るまでの開発作業において、気軽に繰り返し利用することを想定している
