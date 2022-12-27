import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { GenericTable } from "./GenericTable";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
export class SpaceStack extends Stack {
  private api =new RestApi(this,'SpaceApi')
  private api2 = new RestApi(this,'putAPi')
  private spacesTable = new GenericTable(
    'SpaceTable',
    'spaceId',
    this
  )
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaFunction(this, "helloLambda", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(join(__dirname,'..','services','hello')),
      handler: 'hello.main'
    });

    const helloLambdaIntegreation = new LambdaIntegration(helloLambda);
    const helloLambdaResource = this.api.root.addResource("hello");
    helloLambdaResource.addMethod("GET", helloLambdaIntegreation);

      
    const dynamoPolicy = new PolicyStatement();
    dynamoPolicy.addActions("dynamodb:*");
    dynamoPolicy.addResources("*");
    
    const putItemLambdaNodejs = new LambdaFunction(
      this,
      "putItemLambdaNodejs",
      {
        runtime: Runtime.NODEJS_16_X,
        code: Code.fromAsset(
          join(__dirname, "../services/SpaceTable")
        ),
        handler: "create.handler",
      }
    );
     putItemLambdaNodejs.addToRolePolicy(dynamoPolicy);

     const putAPiIntegration = new LambdaIntegration(putItemLambdaNodejs);
     const putLambdaResource = this.api2.root.addResource("create");
     putLambdaResource.addMethod("PUT", putAPiIntegration);
    
  }
}
