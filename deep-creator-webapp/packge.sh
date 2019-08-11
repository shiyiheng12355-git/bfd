#!/bin/bash
# 测试环境构建
DISABLE_ESLINT=true BUILD_ENV=test NO_COMPRESS=true npm run build
# 测试环境发布
scp -r dist/* root@172.18.1.165:/home/dpc/www/ jWDErStSNGM=
# 生产环境构建
DISABLE_ESLINT=true BUILD_ENV=production npm run build
# 生产环境发布
# TODO
# Package File
tar czf webapp-0.0.8.tar.gz dist/*
# Send File
scp webapp-0.0.8.tar.gz dpc@172.18.1.150:/opt/dpc

# Licence测试环境
scp webapp-0.0.9.tar.gz root@172.18.1.147:/opt/bfd/deepcreator/package/common/deepcreatorweb-for-license/