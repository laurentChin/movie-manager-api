.SILENT:

COLOR_INFO    = \033[32m
COLOR_SUCCESS = \033[34m
COLOR_ERROR   = \033[31m

install:
	npm install
	if [ -f "./environment.json" ];\
	then\
		printf "${COLOR_INFO}environment.json already exist\n";\
	else\
		printf "${COLOR_INFO}environment.json doesn't seems to exist\n";\
		printf "${COLOR_INFO}start creating a fresh one by copying environment.json.dist\n";\
		cp environment.json.dist environment.json;\
		if [ -f "./environment.json" ];\
		then\
			printf "${COLOR_SUCCESS}environment.json has been successfully created\n";\
		else\
			printf "${COLOR_ERROR}there is an error happening creating environment.json\n";\
		fi;\
	fi