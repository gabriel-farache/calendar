FROM node:latest

MAINTAINER gabriel.farache@gmail.com

RUN mkdir -p /pechbusque-calendar/front-end
WORKDIR /pechbusque-calendar/front-end
ADD . /pechbusque-calendar/front-end

RUN apt-get update -qq && apt-get install -y build-essential git git-core ruby-dev rubygems
RUN     npm install -g bower 
RUN     npm install -g grunt-cli
RUN     npm install 
RUN     bower install --allow-root
RUN	gem update --system
RUN 	gem update
RUN	gem install compass

CMD 	./dockerFrontEndRunScript.sh && grunt serve:dist -—force

EXPOSE  9000
