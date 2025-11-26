import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  contentTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda function para manejar posts
    const postsHandler = new lambda.Function(this, 'PostsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'posts-handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: props.contentTable.tableName,
        CONTENT_TYPE: 'posts'
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Lambda function para manejar eventos
    const eventsHandler = new lambda.Function(this, 'EventsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'events-handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: props.contentTable.tableName,
        CONTENT_TYPE: 'events'
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Permisos para acceder a DynamoDB
    props.contentTable.grantReadWriteData(postsHandler);
    props.contentTable.grantReadWriteData(eventsHandler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'TiburonApi', {
      restApiName: 'Tiburon Content API',
      description: 'API para gestionar contenido del AWS User Group',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Recursos y métodos para posts
    const postsResource = api.root.addResource('posts');
    postsResource.addMethod('GET', new apigateway.LambdaIntegration(postsHandler));
    postsResource.addMethod('POST', new apigateway.LambdaIntegration(postsHandler));

    const postResource = postsResource.addResource('{id}');
    postResource.addMethod('GET', new apigateway.LambdaIntegration(postsHandler));
    postResource.addMethod('PUT', new apigateway.LambdaIntegration(postsHandler));
    postResource.addMethod('DELETE', new apigateway.LambdaIntegration(postsHandler));

    // Recursos y métodos para eventos
    const eventsResource = api.root.addResource('events');
    eventsResource.addMethod('GET', new apigateway.LambdaIntegration(eventsHandler));
    eventsResource.addMethod('POST', new apigateway.LambdaIntegration(eventsHandler));

    const eventResource = eventsResource.addResource('{id}');
    eventResource.addMethod('GET', new apigateway.LambdaIntegration(eventsHandler));
    eventResource.addMethod('PUT', new apigateway.LambdaIntegration(eventsHandler));
    eventResource.addMethod('DELETE', new apigateway.LambdaIntegration(eventsHandler));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      exportName: 'TiburonApiUrl'
    });
  }
}
