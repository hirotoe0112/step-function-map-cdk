interface Person {
  name: string
  age: number
  address: string
}
export const handler = async (): Promise<Person[]> => {
  try {
    console.log("start get-list.ts")

    // 並列に処理したい各データ
    const data = [
      {
        name: 'Tanaka',
        age: 20,
        address: 'Tokyo',
      },
      {
        name: 'Mizuno',
        age: 30,
        address: 'Osaka',
      },
      {
        name: 'Yamada',
        age: 25,
        address: 'Nagoya',
      },
      {
        name: 'Sato',
        age: 28,
        address: 'Fukuoka',
      },
    ]

    return data
  } catch (error) {
    throw error
  }
}