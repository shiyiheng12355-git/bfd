import { request, config } from 'utils';

const { api } = config;
const { entities } = api;

export async function query({ payload }) {
  return request({
    url: entities,
    method: 'get',
    data: payload,
  });
}

export async function create({ payload }) {
  return request({
    url: entities,
    method: 'post',
    data: payload,
  });
}

