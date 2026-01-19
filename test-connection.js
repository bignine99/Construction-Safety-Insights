const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 [테스트] 네이버 클라우드 DB 접속 시도 중...');
  console.log('Host: db-3jkbdg-kr.vpc-pub-cdb.ntruss.com');
  console.log('User: bignine');
  
  try {
    const connection = await mysql.createConnection({
      host: 'db-3jkbdg-kr.vpc-pub-cdb.ntruss.com',
      user: 'bignine',
      password: 'rirm-0172',
      database: 'safety-dashboard',
      port: 3306,
      connectTimeout: 10000 // 10초 대기
    });
    
    console.log('✅ [성공] 네이버 클라우드 MySQL 연결에 성공했습니다!');
    await connection.end();
  } catch (error) {
    console.error('❌ [실패] 연결할 수 없습니다.');
    console.error('에러 코드:', error.code);
    console.error('에러 메시지:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 원인 분석: 연결 시간 초과 (Timeout)');
      console.log('1. 네이버 클라우드 ACG 설정에서 [적용] 버튼을 누르셨는지 다시 확인해 주세요.');
      console.log('2. 현재 사용 중인 인터넷망(회사/공공장소 등)에서 3306 포트를 차단했을 수 있습니다.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 원인 분석: 계정 정보 오류');
      console.log('아이디(bignine) 또는 비밀번호(rirm-0172)가 DB 생성 시 설정한 것과 맞는지 확인해 주세요.');
    }
  }
}

testConnection();
