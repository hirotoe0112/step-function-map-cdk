interface ProcessEvent {
  param: {
    name: string
    age: number
  }
}
export const handler = async (event: ProcessEvent): Promise<void> => {
  try {
    console.log(`start some-process.ts name: ${event.param.name} age: ${event.param.age}`)

    // 時間がかかる処理
    await sleep(5000)

    console.log(`end some-process.ts name: ${event.param.name} age: ${event.param.age}`)
  } catch (error) {
    throw error
  }
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec))