MYIP:=$(shell hostname -i)

frontend:
	sudo make -f ../common/Makefile.prereqs
	sudo docker-compose up -d
	bash ../common/wait_for_xos.sh
	sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/configurations/frontend/sample.yaml
	# sudo docker-compose run xos python manage.py makemigrations mcordservice
	# sudo docker-compose run xos python manage.py syncdb
	# sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/tosca/MCORDServiceN.yaml

containers:
	cd ../../../containers/xos; make devel

stop:
	sudo docker-compose stop

showlogs:
	sudo docker-compose logs

rm: stop
	sudo docker-compose rm

ps:
	sudo docker-compose ps

enter-xos:
	sudo docker exec -ti frontend_xos_1 bash

mock-cord:
	sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/configurations/common/fixtures.yaml
	sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/configurations/frontend/mocks/cord.yaml
	sudo docker exec frontend_xos_1 cp /opt/xos/configurations/cord/xos_cord_config /opt/xos/xos_configuration/
	sudo docker exec frontend_xos_1 touch /opt/xos/xos/settings.py

mock-mcord:
	sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/configurations/common/fixtures.yaml
	sudo docker-compose run xos python /opt/xos/tosca/run.py padmin@vicci.org /opt/xos/configurations/frontend/mocks/mcord.yaml
	sudo docker exec frontend_xos_1 cp /opt/xos/configurations/frontend/mocks/xos_mcord_config /opt/xos/xos_configuration/
	sudo docker exec frontend_xos_1 touch /opt/xos/xos/settings.py
