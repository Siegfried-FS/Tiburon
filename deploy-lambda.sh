#!/bin/bash

# Crear función Lambda
aws lambda create-function \
    --function-name telegram-event-notifier \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
    --handler lambda-telegram-events.handler \
    --zip-file fileb://lambda-telegram-events.zip \
    --environment Variables='{TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN,TELEGRAM_CHAT_ID=YOUR_CHAT_ID}'

# Crear regla EventBridge (ejemplo para evento del 22 Nov)
aws events put-rule \
    --name workshop-ugm-reminder \
    --schedule-expression "at(2025-11-22T15:45:00)" \
    --description "Reminder 15 min before UGM workshop"

# Conectar EventBridge con Lambda
aws events put-targets \
    --rule workshop-ugm-reminder \
    --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:telegram-event-notifier","Input"='{"title":"Workshop AWS - Fundamentos Cloud","date":"22 Nov 2025, 4:00 PM","location":"UGM Campus Playa Vicente","description":"Aprende fundamentos de AWS y crea tu primer sitio web con S3","image_url":"https://images.unsplash.com/photo-1573495627361-d9b87960b12d","registration_url":"https://luma.com/njx6wlpp"}'
