FROM python:2-alpine

RUN apk --no-cache add build-base python-dev py-pip jpeg-dev zlib-dev

WORKDIR /usr/src/app

COPY pip-requirements.txt ./
RUN pip install --no-cache-dir -r pip-requirements.txt

COPY . .

CMD [ "python", "./application.py" ]
