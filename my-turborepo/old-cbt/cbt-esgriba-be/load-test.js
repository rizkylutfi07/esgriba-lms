import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 40 },
    { duration: '2m', target: 40 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  // Test endpoint yang tidak butuh auth
  let res = http.get('http://localhost:8000/');  // Health check
  
  check(res, { 
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}