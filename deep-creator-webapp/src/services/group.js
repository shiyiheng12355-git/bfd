import { stringify } from 'qs';
// import request from '../utils/request';
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
