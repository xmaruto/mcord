FROM       ubuntu:14.04.3

# XXX Workaround for docker bug:
# https://github.com/docker/docker/issues/6345
# Kernel 3.15 breaks docker, uss the line below as a workaround
# until there is a fix
RUN ln -s -f /bin/true /usr/bin/chfn
# XXX End workaround

# Install.
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y \
    curl \
    gcc \
    geoip-database \
    git \
    graphviz \
    graphviz-dev \
    libgeoip1 \
    libxslt1.1 \
    libxslt1-dev \
    libyaml-dev \
    m4 \
    pkg-config \
    python-dev \
    python-httplib2 \
    python-pip \
    python-psycopg2 \
    python-pycurl \
    python-setuptools \
    tar \
    wget \
##### observer dependencies
    python-keystoneclient \
    python-novaclient \
    python-neutronclient \
    python-glanceclient \
    python-ceilometerclient

RUN pip install \
    django==1.7 \
    django-bitfield \
    django-crispy-forms \
    django-encrypted-fields \
    django-extensions \
    django-filter==0.11.0 \
    django-geoposition \
    django-ipware \
    django_rest_swagger \
    django-suit==0.3a1 \
    django-timezones \
    djangorestframework==3.3.3 \
    dnslib \
    lxml \
    markdown \
    netaddr \
    pyOpenSSL \
    psycopg2 \
    python-ceilometerclient \
    python-dateutil \
    python-keyczar \
    python-logstash \
    pygraphviz \
    pytz \
    pyyaml \
    requests

RUN easy_install --upgrade httplib2

RUN easy_install \
    python_gflags \
    google_api_python_client \
    httplib2.ca_certs_locater

ADD http://code.jquery.com/jquery-1.9.1.min.js /usr/local/lib/python2.7/dist-packages/suit/static/suit/js/

# Install XOS
RUN git clone git://github.com/open-cloud/xos.git /tmp/xos && \
    mv /tmp/xos/xos /opt/ && \
    chmod +x /opt/xos/tools/xos-manage && \
    /opt/xos/tools/xos-manage genkeys

# install Tosca engine
RUN chmod +x /opt/xos/tosca/run.py
RUN bash /opt/xos/tosca/install_tosca.sh

EXPOSE 8000

# Set environment variables.
ENV HOME /root

# Define working directory.
WORKDIR /opt/xos

# Define default command.
CMD update-ca-certificates && python /opt/xos/manage.py runserver 0.0.0.0:8000 --insecure --makemigrations
