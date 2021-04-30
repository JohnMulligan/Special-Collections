FROM php:7.4-apache-buster

# Omeka-S web publishing platform for digital heritage collections (https://omeka.org/s/)
# Previous maintainers: Oldrich Vykydal (o1da) - Klokan Technologies GmbH  / Eric Dodemont <eric.dodemont@skynet.be>
# MAINTAINER Giorgio Comai <g@giorgiocomai.eu>

RUN a2enmod rewrite

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -qq update && apt-get -qq -y upgrade
RUN apt-get -qq update && apt-get -qq -y --no-install-recommends install \
    unzip \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libmcrypt-dev \
    libpng-dev \
    libjpeg-dev \
    libmemcached-dev \
    zlib1g-dev \
    imagemagick \
    libmagickwand-dev \
    wget \
    ghostscript \
    poppler-utils

# Install the PHP extensions we need
RUN docker-php-ext-configure gd --with-jpeg=/usr/include/ --with-freetype=/usr/include/
RUN docker-php-ext-install -j$(nproc) iconv pdo pdo_mysql mysqli gd
RUN yes | pecl install  mcrypt-1.0.3 && docker-php-ext-enable mcrypt && yes | pecl install imagick && docker-php-ext-enable imagick

# Add the Omeka-S PHP code
# Latest Omeka version, check: https://omeka.org/s/download/
RUN wget --no-verbose "https://github.com/omeka/omeka-s/releases/download/v3.0.0/omeka-s-3.0.0.zip" -O /var/www/latest_omeka_s.zip
RUN unzip -q /var/www/latest_omeka_s.zip -d /var/www/ \
&&  rm /var/www/latest_omeka_s.zip \
&&  rm -rf /var/www/html/ \
&&  mv /var/www/omeka-s/ /var/www/html/

# Add Omeka-S Theme default module
# RUN wget --no-verbose "https://github.com/omeka-s-themes/default/releases/download/v1.6.0/theme-default-v1.6.0.zip" -O /var/www/html/theme-default-v1.6.0.zip
# RUN unzip -q /var/www/html/theme-default-v1.6.0.zip -d /var/www/html/modules/ \
# &&  rm /var/www/html/theme-default-v1.6.0.zip

# Add Omeka-S Custom Ontology module
RUN wget --no-verbose "https://github.com/Daniel-KM/Omeka-S-module-CustomOntology/archive/refs/tags/3.3.5.zip" -O /var/www/html/Custom-Ontology-3.3.5.zip
RUN unzip -q /var/www/html/Custom-Ontology-3.3.5.zip -d /var/www/html/modules/ \
&&  mv /var/www/html/modules/Omeka-S-module-CustomOntology-3.3.5 /var/www/html/modules/CustomOntology \
&&  rm /var/www/html/Custom-Ontology-3.3.5.zip

# Add Omeka-S Iiif Server module
RUN wget --no-verbose "https://github.com/Daniel-KM/Omeka-S-module-IiifServer/releases/download/3.6.3.0/IiifServer-3.6.3.0.zip" -O /var/www/html/IiifServer-3.6.3.0.zip
RUN unzip -q /var/www/html/IiifServer-3.6.3.0.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/IiifServer-3.6.3.0.zip

# Add Omeka-S Image Server module
RUN wget --no-verbose "https://github.com/Daniel-KM/Omeka-S-module-ImageServer/releases/download/3.6.5.3/ImageServer-3.6.5.3.zip" -O /var/www/html/ImageServer-3.6.5.3.zip
RUN unzip -q /var/www/html/ImageServer-3.6.5.3.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/ImageServer-3.6.5.3.zip

# Add Omeka-S Mapping module
RUN wget --no-verbose "https://github.com/omeka-s-modules/Mapping/releases/download/v1.4.0/Mapping-1.4.0.zip" -O /var/www/html/Mapping-1.4.0.zip
RUN unzip -q /var/www/html/Mapping-1.4.0.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/Mapping-1.4.0.zip

# Add Omeka-S Numeric Data Types module
RUN wget --no-verbose "https://github.com/omeka-s-modules/NumericDataTypes/releases/download/v1.5.0/NumericDataTypes-1.5.0.zip" -O /var/www/html/NumericDataTypes-1.5.0.zip
RUN unzip -q /var/www/html/NumericDataTypes-1.5.0.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/NumericDataTypes-1.5.0.zip

# Add Omeka-S Universal Viewer module
RUN wget --no-verbose "https://github.com/Daniel-KM/Omeka-S-module-UniversalViewer/releases/download/3.6.3.2/UniversalViewer-3.6.3.2.zip" -O /var/www/html/UniversalViewer-3.6.3.2.zip
RUN unzip -q /var/www/html/UniversalViewer-3.6.3.2.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/UniversalViewer-3.6.3.2.zip

# Add Omeka-S Zotero Import module
RUN wget --no-verbose "https://github.com/omeka-s-modules/ZoteroImport/releases/download/v1.2.0/ZoteroImport-1.2.0.zip" -O /var/www/html/ZoteroImport-1.2.0.zip
RUN unzip -q /var/www/html/ZoteroImport-1.2.0.zip -d /var/www/html/modules/ \
&&  rm /var/www/html/ZoteroImport-1.2.0.zip

COPY ./imagemagick-policy.xml /etc/ImageMagick-6/policy.xml

RUN rm /var/www/html/.htaccess \
&& rm /var/www/html/config/database.ini \
&& rm /var/www/html/config/local.config.php

RUN chown -R www-data:www-data /var/www/html/

CMD echo "ServerName localhost" >> /etc/apache2/apache2.conf
CMD ["apache2-foreground"]
