# Stage 1: Compilar o aplicativo
FROM node:18 as compile

# Definir variáveis de ambiente e argumentos
ARG ENV=development
ARG TOKEN

ENV NODE_ENV=${ENV}

# Clear Cache
RUN npm cache clean --force

# Configurar o diretório de trabalho
WORKDIR /compile

# Copiar arquivos necessários
COPY . .
COPY package.json .
COPY .babelrc .
COPY .env.${ENV} .env

# Instalar dependências
RUN npm install

# Executar o build do projeto
RUN npm run build --prod

# Stage 2: Preparar para implantação
FROM nginx:alpine as deploy

# Configurar o diretório de trabalho
WORKDIR /web

# Copiar o arquivo de configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos construídos do estágio de compilação
COPY --from=compile /compile/build .

# Comando para iniciar o servidor nginx
CMD ["nginx", "-g", "daemon off;"]
