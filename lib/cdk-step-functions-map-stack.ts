import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogLevel, StateMachine, Map } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStepFunctionsMapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // データ一覧を取得するLambda関数
    const getListLambda = new NodejsFunction(
      this,
      'GetListLambda',
      {
        entry: './lambda/get-list.ts',
        handler: 'handler',
        timeout: Duration.minutes(10),
        memorySize: 256,
        runtime: Runtime.NODEJS_18_X,
      }
    )
    // 各データに対して処理するLambda関数
    const someProcessLambda = new NodejsFunction(
      this,
      'SomeProcessLambda',
      {
        entry: './lambda/some-process.ts',
        handler: 'handler',
        timeout: Duration.minutes(10),
        memorySize: 256,
        runtime: Runtime.NODEJS_18_X,
      }
    )

    // データ一覧を取得するLambda関数を実行するプロセス
    const getListProcessState = new LambdaInvoke(
      this,
      'getListProcessState',
      {
        lambdaFunction: getListLambda,
      }
    )
    // 各データに対して処理するLambda関数を実行するプロセス
    const someProcessProcessState = new LambdaInvoke(
      this,
      'someProcessProcessState',
      {
        lambdaFunction: someProcessLambda,
      }
    )
    // 人物一覧を分割するためのMap関数
    const mapPersonsProcessState = new Map(this, 'mapPersons', {
      itemsPath: '$.Payload',
      maxConcurrency: 1,
      resultPath: '$.mapOutput',
      parameters: {
        param: {
          'name.$': '$$.Map.Item.Value.name',
          'age.$': '$$.Map.Item.Value.age',
        },
      },
    })
    mapPersonsProcessState.iterator(someProcessProcessState)

    // リトライ設定
    getListProcessState.addRetry({
      interval: Duration.seconds(10),
      maxAttempts: 2,
      backoffRate: 2,
    })
    someProcessProcessState.addRetry({
      interval: Duration.seconds(10),
      maxAttempts: 2,
      backoffRate: 2,
    })

    // Step Functionsを作成
    const sampleStateMachine = new StateMachine(
      this,
      'sampleStateMachine',
      {
        stateMachineName: `sampleStateMachine`,
        definition:
          getListProcessState.next(mapPersonsProcessState),
        logs: {
          level: LogLevel.ALL,
          destination: new LogGroup(
            this,
            'SampleStateMachineLogGroup',
            {
              retention: RetentionDays.ONE_WEEK,
            }
          ),
        },
      }
    )
  }
}
