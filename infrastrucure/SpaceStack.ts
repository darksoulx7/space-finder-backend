import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

import { GenericTable } from "./GenericTable";
export class SpaceStack extends Stack {
  private api = new RestApi(this, "SpaceApi");

  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "create",
    readLambdaPath: "read",
  });

  

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
  }
}


    // const dynamoPolicy = new PolicyStatement();
    // dynamoPolicy.addActions("dynamodb:*");
    // dynamoPolicy.addResources("*");

 // const putItemSpacesTable = new LambdaFunction(this, "putItemSpacesTable", {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(join(__dirname, "../services/SpacesTable")),
    //   handler: "create.handler",
    // });
    // putItemSpacesTable.addToRolePolicy(dynamoPolicy);

    // const putLambdaResource = this.createApi.root.addResource("create");
    // putLambdaResource.addMethod("PUT", putSpacesIntegration);
   // const helloLambda = new LambdaFunction(this, "helloLambda", {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(join(__dirname, "..", "services", "hello")),
    //   handler: "hello.main",
    // });
  // private api = new RestApi(this, "SpaceApi");

    // const helloLambdaIntegreation = new LambdaIntegration(helloLambda);
    // const helloLambdaResource = this.api.root.addResource("hello");
    // helloLambdaResource.addMethod("GET", helloLambdaIntegreation);


     // const putItemLambdaNodejs = new LambdaFunction(
    //   this,
    //   "putItemLambdaNodejs",
    //   {
    //     runtime: Runtime.NODEJS_16_X,
    //     code: Code.fromAsset(join(__dirname, "../services/SpaceTable")),
    //     handler: "create.handler",
    //   }
    // );

     //  const putAPiIntegration = new LambdaIntegration(putItemLambdaNodejs);
    //  const putLambdaResource = this.api2.root.addResource("create");
    //  putLambdaResource.addMethod("PUT", putAPiIntegration);
    // putItemLambdaNodejs.addToRolePolicy(dynamoPolicy);
