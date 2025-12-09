const ENV = {
    s3Bucket: 'maskat-lambda-repo',
    lambdaVersion: 'latest',
    s3Stub: false,
}

// yyyy-mm-dd
const Today = new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit", day: "2-digit"}).replaceAll('/', '-')

export { ENV, Today }
