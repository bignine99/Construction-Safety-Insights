const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 DB 접속 테스트 시작...');
  try {
    const connection = await mysql.createConnection("mysql://bignine:rirm-0172@db-3jkbdg-kr.vpc-pub-cdb.ntruss.com:3306/safety-dashboard");
    console.log('✅ 성공: 네이버 클라우드 MySQL에 성공적으로 연결되었습니다!');
    await connection.end();
  } catch (error) {
    console.error('❌ 실패: DB 연결에 실패했습니다.');
    console.error('에러 내용:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.log('💡 팁: 연결 시간 초과입니다. ACG 설정에서 [적용]을 누르셨는지, 혹은 현재 네트워크에서 3306 포트를 막고 있지 않은지 확인해 주세요.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 팁: 아이디 또는 비밀번호가 틀렸습니다.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 팁: Host 주소를 찾을 수 없습니다. 주소 오타를 확인해 주세요.');
    }
  }
}

testConnection();
