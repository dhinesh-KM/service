CONSUMER_SERVICE_URL=http://127.0.0.1:8000
DOCUMENT_SERVICE_URL=http://127.0.0.1:6000
CORS=https://editor.swagger.io


CONSUMER_SERVICE_URL=https://consumer-service-l4xd.onrender.com
DOCUMENT_SERVICE_URL=https://document-service-d6nf.onrender.com
CORS=https://editor.swagger.io


const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}`})
console.log(process.env.CONSUMER_SERVICE_URL, process.env.DOCUMENT_SERVICE_URL, process.env.CORS)

http:
    port: 8080
    cors:
        origin:
            - "*"
            - ${CORS}
        methods: "GET, POST, PUT, DELETE"
        credentials: true

apiEndpoints:
    consumer:
        host: "*"
        path: "/api/v1/consumer/*"
    document:
        host: "*"
        path: "/api/v1/document/*"

serviceEndpoints:
    consumerService:
        url: ${CONSUMER_SERVICE_URL}
    documentService:
        url: ${DOCUMENT_SERVICE_URL}

policies:
    - basic-auth
    - cors
    - log
    - expression
    - key-auth
    - oauth2
    - proxy
    - rate-limit

pipelines:
    consumerPipeline:
        apiEndpoints:
            - consumer
        policies:
            - cors:
                  - action:
                        origin:
                            - ${CORS}
                            - "*"
                        methods: "GET, POST, PUT, DELETE"
                        credentials: true
            - log:
                  - action:
                        message: "consumer received"
                        level: "info"
            - proxy:
                  - action:
                        serviceEndpoint: consumerService
                        changeOrigin: true

    documentPipeline:
        apiEndpoints:
            - document
        policies:
            - cors:
                  - action:
                        origin:
                            - ${CORS}
                            - "*"
                        methods: "GET, POST, PUT, DELETE"
                        credentials: true
            - log:
                  - action:
                        message: "document received"
                        level: "info"
            - proxy:
                  - action:
                        serviceEndpoint: documentService
                        changeOrigin: true
