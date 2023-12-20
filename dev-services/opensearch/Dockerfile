FROM opensearchproject/opensearch:2.8.0

ARG DICTIONARY_VERSION=20230927

RUN bin/opensearch-plugin install https://github.com/WorksApplications/elasticsearch-sudachi/releases/download/v3.1.0/opensearch-2.8.0-analysis-sudachi-3.1.0.zip && \
    curl -Lo sudachi-dictionary-${DICTIONARY_VERSION}.zip http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-${DICTIONARY_VERSION}-core.zip && \
    jar xvf sudachi-dictionary-${DICTIONARY_VERSION}.zip && \
    mkdir -p config/sudachi/ && \
    mv sudachi-dictionary-${DICTIONARY_VERSION}/system_core.dic config/sudachi/ && \
    rm -rf sudachi-dictionary-${DICTIONARY_VERSION}.zip sudachi-dictionary-${DICTIONARY_VERSION}/


