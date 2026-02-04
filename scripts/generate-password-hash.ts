import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function generateHash(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean)

  if (args.length === 0) {
    const input = await new Promise<string>((resolve) => {
      let data = ''
      process.stdin.setEncoding('utf-8')
      process.stdin.on('data', (chunk) => {
        data += chunk
      })
      process.stdin.on('end', () => resolve(data))
    })

    const lines = input.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) {
      console.log('パスワードを引数または標準入力で渡してください。')
      process.exit(1)
    }

    for (const line of lines) {
      const hash = await generateHash(line)
      console.log(hash)
    }

    return
  }

  for (const password of args) {
    const hash = await generateHash(password)
    console.log(hash)
  }
}

main()
