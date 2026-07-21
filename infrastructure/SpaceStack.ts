import { Stack, StackProps } from "aws-cdk-lib";
import { AuthorizationType, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { AuthorizerWrapper } from "./auth/AuthorizationWrapper";
import { GenericTable } from "./GenericTable";

export class SpaceStack extends Stack {
  private api = new RestApi(this, "SpaceApi");
  private authorizer: AuthorizerWrapper;
  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "create",
    readLambdaPath: "read",
    secondaryIndexes: ["galaxyName"],
    updateLambdaPath: "update",
    deleteLambdaPath: "delete",
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.authorizer = new AuthorizerWrapper(this, this.api);

    const optionWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    });
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration, optionWithAuthorizer);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration, optionWithAuthorizer);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration, optionWithAuthorizer);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration, optionWithAuthorizer);
  }
}
