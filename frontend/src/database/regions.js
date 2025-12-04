// src/database/regions.js
// 대한민국 17개 시·도 + 주요 시·군·구
// id 규칙: <region>_<detail> (A 타입: 광역 먼저)
// 각 광역 children 첫 항목은 "<region>_all" (예: seoul_all)

export const REGIONS = [
  // -------------------------------
  // 부산광역시
  // -------------------------------
  {
    id: 'seoul',
    name: '서울',
    children: [
      { id: 'seoul_all', name: '서울 전체' },
      { id: 'seoul_jongno', name: '종로구' },
      { id: 'seoul_junggu', name: '중구' },
      { id: 'seoul_yongsan', name: '용산구' },
      { id: 'seoul_seongdong', name: '성동구' },
      { id: 'seoul_gwangjin', name: '광진구' },
      { id: 'seoul_dongdaemun', name: '동대문구' },
      { id: 'seoul_jungnang', name: '중랑구' },
      { id: 'seoul_seongbuk', name: '성북구' },
      { id: 'seoul_gangbuk', name: '강북구' },
      { id: 'seoul_dobong', name: '도봉구' },
      { id: 'seoul_nowon', name: '노원구' },
      { id: 'seoul_eunpyeong', name: '은평구' },
      { id: 'seoul_seodaemun', name: '서대문구' },
      { id: 'seoul_mapo', name: '마포구' },
      { id: 'seoul_yangcheon', name: '양천구' },
      { id: 'seoul_gangseo', name: '강서구' },
      { id: 'seoul_guro', name: '구로구' },
      { id: 'seoul_geumcheon', name: '금천구' },
      { id: 'seoul_yeongdeungpo', name: '영등포구' },
      { id: 'seoul_dongjak', name: '동작구' },
      { id: 'seoul_gwanak', name: '관악구' },
      { id: 'seoul_seocho', name: '서초구' },
      { id: 'seoul_gangnam', name: '강남구' },
      { id: 'seoul_songpa', name: '송파구' },
      { id: 'seoul_gangdong', name: '강동구' }
    ]
  },

  // -------------------------------
  // 부산광역시
  // -------------------------------
  {
    id: 'busan',
    name: '부산',
    children: [
      { id: 'busan_all', name: '부산 전체' },
      { id: 'busan_junggu', name: '중구' },
      { id: 'busan_seogu', name: '서구' },
      { id: 'busan_donggu', name: '동구' },
      { id: 'busan_youngdo', name: '영도구' },
      { id: 'busan_busanjin', name: '부산진구' },
      { id: 'busan_dongnae', name: '동래구' },
      { id: 'busan_namgu', name: '남구' },
      { id: 'busan_bukgu', name: '북구' },
      { id: 'busan_haeundae', name: '해운대구' },
      { id: 'busan_saha', name: '사하구' },
      { id: 'busan_geumjeong', name: '금정구' },
      { id: 'busan_gangseo', name: '강서구' },
      { id: 'busan_yeonje', name: '연제구' },
      { id: 'busan_suyeong', name: '수영구' },
      { id: 'busan_sasang', name: '사상구' },
      { id: 'busan_gijang', name: '기장군' }
    ]
  },

  // -------------------------------
  // 대구광역시
  // -------------------------------
  {
    id: 'daegu',
    name: '대구',
    children: [
      { id: 'daegu_all', name: '대구 전체' },
      { id: 'daegu_junggu', name: '중구' },
      { id: 'daegu_donggu', name: '동구' },
      { id: 'daegu_seogu', name: '서구' },
      { id: 'daegu_namgu', name: '남구' },
      { id: 'daegu_bukgu', name: '북구' },
      { id: 'daegu_suseong', name: '수성구' },
      { id: 'daegu_dalseo', name: '달서구' },
      { id: 'daegu_dalseong', name: '달성군' }
    ]
  },

  // -------------------------------
  // 인천광역시
  // -------------------------------
  {
    id: 'incheon',
    name: '인천',
    children: [
      { id: 'incheon_all', name: '인천 전체' },
      { id: 'incheon_junggu', name: '중구' },
      { id: 'incheon_donggu', name: '동구' },
      { id: 'incheon_michuhol', name: '미추홀구' },
      { id: 'incheon_yeonsu', name: '연수구' },
      { id: 'incheon_namdong', name: '남동구' },
      { id: 'incheon_bupyeong', name: '부평구' },
      { id: 'incheon_gyeyang', name: '계양구' },
      { id: 'incheon_seogu', name: '서구' },
      { id: 'incheon_ganghwa', name: '강화군' },
      { id: 'incheon_ongjin', name: '옹진군' }
    ]
  },

  // -------------------------------
  // 광주광역시
  // -------------------------------
  {
    id: 'gwangju',
    name: '광주',
    children: [
      { id: 'gwangju_all', name: '광주 전체' },
      { id: 'gwangju_donggu', name: '동구' },
      { id: 'gwangju_seogu', name: '서구' },
      { id: 'gwangju_namgu', name: '남구' },
      { id: 'gwangju_bukgu', name: '북구' },
      { id: 'gwangju_gwangsan', name: '광산구' }
    ]
  },

  // -------------------------------
  // 대전광역시
  // -------------------------------
  {
    id: 'daejeon',
    name: '대전',
    children: [
      { id: 'daejeon_all', name: '대전 전체' },
      { id: 'daejeon_donggu', name: '동구' },
      { id: 'daejeon_junggu', name: '중구' },
      { id: 'daejeon_seogu', name: '서구' },
      { id: 'daejeon_yuseong', name: '유성구' },
      { id: 'daejeon_daedeok', name: '대덕구' }
    ]
  },

  // -------------------------------
  // 울산광역시
  // -------------------------------
  {
    id: 'ulsan',
    name: '울산',
    children: [
      { id: 'ulsan_all', name: '울산 전체' },
      { id: 'ulsan_junggu', name: '중구' },
      { id: 'ulsan_namgu', name: '남구' },
      { id: 'ulsan_donggu', name: '동구' },
      { id: 'ulsan_bukgu', name: '북구' },
      { id: 'ulsan_ulju', name: '울주군' }
    ]
  },

  // -------------------------------
  // 세종특별자치시
  // -------------------------------
  {
    id: 'sejong',
    name: '세종',
    children: [
      { id: 'sejong_all', name: '세종 전체' },
      { id: 'sejong_sejong', name: '세종시' }
    ]
  },

  // -------------------------------
  // 경기도
  // -------------------------------
  {
    id: 'gyeonggi',
    name: '경기',
    children: [
      { id: 'gyeonggi_all', name: '경기 전체' },
      { id: 'gyeonggi_suwon', name: '수원시' },
      { id: 'gyeonggi_seongnam', name: '성남시' },
      { id: 'gyeonggi_anyang', name: '안양시' },
      { id: 'gyeonggi_bucheon', name: '부천시' },
      { id: 'gyeonggi_ansan', name: '안산시' },
      { id: 'gyeonggi_goyang', name: '고양시' },
      { id: 'gyeonggi_gimpo', name: '김포시' },
      { id: 'gyeonggi_yongin', name: '용인시' },
      { id: 'gyeonggi_siheung', name: '시흥시' },
      { id: 'gyeonggi_pyeongtaek', name: '평택시' },
      { id: 'gyeonggi_namyangju', name: '남양주시' },
      { id: 'gyeonggi_hanam', name: '하남시' },
      { id: 'gyeonggi_gwangmyeong', name: '광명시' },
      { id: 'gyeonggi_paju', name: '파주시' },
      { id: 'gyeonggi_icheon', name: '이천시' },
      { id: 'gyeonggi_anseong', name: '안성시' },
      { id: 'gyeonggi_gwangju', name: '광주시' },
      { id: 'gyeonggi_hwaseong', name: '화성시' },
      { id: 'gyeonggi_yangju', name: '양주시' },
      { id: 'gyeonggi_pocheon', name: '포천시' },
      { id: 'gyeonggi_gapyeong', name: '가평군' },
      { id: 'gyeonggi_yangpyeong', name: '양평군' },
      { id: 'gyeonggi_yeoju', name: '여주시' },
      { id: 'gyeonggi_uwijeongbu', name: '의정부시' },
      { id: 'gyeonggi_gunpo', name: '군포시' },
      { id: 'gyeonggi_uiwang', name: '의왕시' },
      { id: 'gyeonggi_gaepyeong', name: '개평(명칭참고)' } // placeholder if needed
    ].filter(Boolean)
  },

  // -------------------------------
  // 강원특별자치도
  // -------------------------------
  {
    id: 'gangwon',
    name: '강원',
    children: [
      { id: 'gangwon_all', name: '강원 전체' },
      { id: 'gangwon_chuncheon', name: '춘천시' },
      { id: 'gangwon_wonju', name: '원주시' },
      { id: 'gangwon_gangneung', name: '강릉시' },
      { id: 'gangwon_donghae', name: '동해시' },
      { id: 'gangwon_taebaek', name: '태백시' },
      { id: 'gangwon_sokcho', name: '속초시' },
      { id: 'gangwon_samcheok', name: '삼척시' },
      { id: 'gangwon_hongcheon', name: '홍천군' },
      { id: 'gangwon_hoengseong', name: '횡성군' },
      { id: 'gangwon_yeongwol', name: '영월군' },
      { id: 'gangwon_pyeongchang', name: '평창군' },
      { id: 'gangwon_jeongseon', name: '정선군' },
      { id: 'gangwon_cheorwon', name: '철원군' },
      { id: 'gangwon_hwacheon', name: '화천군' },
      { id: 'gangwon_yanggu', name: '양구군' },
      { id: 'gangwon_inje', name: '인제군' },
      { id: 'gangwon_goseong', name: '고성군' },
      { id: 'gangwon_yangyang', name: '양양군' }
    ]
  },

  // -------------------------------
  // 충청북도
  // -------------------------------
  {
    id: 'chungbuk',
    name: '충북',
    children: [
      { id: 'chungbuk_all', name: '충북 전체' },
      { id: 'chungbuk_cheongju', name: '청주시' },
      { id: 'chungbuk_chungju', name: '충주시' },
      { id: 'chungbuk_jecheon', name: '제천시' },
      { id: 'chungbuk_boeun', name: '보은군' },
      { id: 'chungbuk_okcheon', name: '옥천군' },
      { id: 'chungbuk_yeongdong', name: '영동군' },
      { id: 'chungbuk_jincheon', name: '진천군' },
      { id: 'chungbuk_goesan', name: '괴산군' },
      { id: 'chungbuk_eumseong', name: '음성군' },
      { id: 'chungbuk_danyang', name: '단양군' }
    ]
  },

  // -------------------------------
  // 충청남도
  // -------------------------------
  {
    id: 'chungnam',
    name: '충남',
    children: [
      { id: 'chungnam_all', name: '충남 전체' },
      { id: 'chungnam_cheonan', name: '천안시' },
      { id: 'chungnam_gongju', name: '공주시' },
      { id: 'chungnam_boryeong', name: '보령시' },
      { id: 'chungnam_asan', name: '아산시' },
      { id: 'chungnam_seosan', name: '서산시' },
      { id: 'chungnam_nonsan', name: '논산시' },
      { id: 'chungnam_gyeoryeong', name: '계룡시' },
      { id: 'chungnam_dangjin', name: '당진시' },
      { id: 'chungnam_geumsan', name: '금산군' },
      { id: 'chungnam_buyeo', name: '부여군' },
      { id: 'chungnam_seocheon', name: '서천군' },
      { id: 'chungnam_cheongyang', name: '청양군' },
      { id: 'chungnam_hongseong', name: '홍성군' },
      { id: 'chungnam_yesan', name: '예산군' },
      { id: 'chungnam_taean', name: '태안군' }
    ]
  },

  // -------------------------------
  // 전라북도
  // -------------------------------
  {
    id: 'jeonbuk',
    name: '전북',
    children: [
      { id: 'jeonbuk_all', name: '전북 전체' },
      { id: 'jeonbuk_jeonju', name: '전주시' },
      { id: 'jeonbuk_gunsan', name: '군산시' },
      { id: 'jeonbuk_iksan', name: '익산시' },
      { id: 'jeonbuk_jeongeup', name: '정읍시' },
      { id: 'jeonbuk_namwon', name: '남원시' },
      { id: 'jeonbuk_gimje', name: '김제시' },
      { id: 'jeonbuk_wanju', name: '완주군' },
      { id: 'jeonbuk_jinan', name: '진안군' },
      { id: 'jeonbuk_muju', name: '무주군' },
      { id: 'jeonbuk_jangsu', name: '장수군' },
      { id: 'jeonbuk_imsil', name: '임실군' },
      { id: 'jeonbuk_sunchang', name: '순창군' },
      { id: 'jeonbuk_gochang', name: '고창군' },
      { id: 'jeonbuk_buan', name: '부안군' }
    ]
  },

  // -------------------------------
  // 전라남도
  // -------------------------------
  {
    id: 'jeonnam',
    name: '전남',
    children: [
      { id: 'jeonnam_all', name: '전남 전체' },
      { id: 'jeonnam_mokpo', name: '목포시' },
      { id: 'jeonnam_yeosu', name: '여수시' },
      { id: 'jeonnam_suncheon', name: '순천시' },
      { id: 'jeonnam_naju', name: '나주시' },
      { id: 'jeonnam_gwangyang', name: '광양시' },
      { id: 'jeonnam_damyang', name: '담양군' },
      { id: 'jeonnam_gokseong', name: '곡성군' },
      { id: 'jeonnam_gurye', name: '구례군' },
      { id: 'jeonnam_goheung', name: '고흥군' },
      { id: 'jeonnam_boseong', name: '보성군' },
      { id: 'jeonnam_hwasun', name: '화순군' },
      { id: 'jeonnam_jangheung', name: '장흥군' },
      { id: 'jeonnam_gangjin', name: '강진군' },
      { id: 'jeonnam_haenam', name: '해남군' },
      { id: 'jeonnam_yeongam', name: '영암군' },
      { id: 'jeonnam_muan', name: '무안군' },
      { id: 'jeonnam_hampyeong', name: '함평군' },
      { id: 'jeonnam_yeonggwang', name: '영광군' },
      { id: 'jeonnam_jangseong', name: '장성군' },
      { id: 'jeonnam_wando', name: '완도군' },
      { id: 'jeonnam_jindo', name: '진도군' },
      { id: 'jeonnam_sinan', name: '신안군' }
    ]
  },

  // -------------------------------
  // 경상북도
  // -------------------------------
  {
    id: 'gyeongbuk',
    name: '경북',
    children: [
      { id: 'gyeongbuk_all', name: '경북 전체' },
      { id: 'gyeongbuk_pohang', name: '포항시' },
      { id: 'gyeongbuk_gyeongju', name: '경주시' },
      { id: 'gyeongbuk_gimcheon', name: '김천시' },
      { id: 'gyeongbuk_andong', name: '안동시' },
      { id: 'gyeongbuk_gumi', name: '구미시' },
      { id: 'gyeongbuk_yeongju', name: '영주시' },
      { id: 'gyeongbuk_yeongcheon', name: '영천시' },
      { id: 'gyeongbuk_sangju', name: '상주시' },
      { id: 'gyeongbuk_mungyeong', name: '문경시' },
      { id: 'gyeongbuk_gyeongsan', name: '경산시' },
      { id: 'gyeongbuk_gunwi', name: '군위군' },
      { id: 'gyeongbuk_uiseong', name: '의성군' },
      { id: 'gyeongbuk_cheongsong', name: '청송군' },
      { id: 'gyeongbuk_yeongyang', name: '영양군' },
      { id: 'gyeongbuk_yeongdeok', name: '영덕군' },
      { id: 'gyeongbuk_cheongdo', name: '청도군' },
      { id: 'gyeongbuk_goryeong', name: '고령군' },
      { id: 'gyeongbuk_seongju', name: '성주군' },
      { id: 'gyeongbuk_chilgok', name: '칠곡군' },
      { id: 'gyeongbuk_yecheon', name: '예천군' },
      { id: 'gyeongbuk_bonghwa', name: '봉화군' },
      { id: 'gyeongbuk_uljin', name: '울진군' },
      { id: 'gyeongbuk_ulleung', name: '울릉군' }
    ]
  },

  // -------------------------------
  // 경상남도
  // -------------------------------
  {
    id: 'gyeongnam',
    name: '경남',
    children: [
      { id: 'gyeongnam_all', name: '경남 전체' },
      { id: 'gyeongnam_changwon', name: '창원시' },
      { id: 'gyeongnam_jinju', name: '진주시' },
      { id: 'gyeongnam_tongyeong', name: '통영시' },
      { id: 'gyeongnam_sacheon', name: '사천시' },
      { id: 'gyeongnam_gimhae', name: '김해시' },
      { id: 'gyeongnam_miryang', name: '밀양시' },
      { id: 'gyeongnam_geoje', name: '거제시' },
      { id: 'gyeongnam_yangsan', name: '양산시' },
      { id: 'gyeongnam_uiryeong', name: '의령군' },
      { id: 'gyeongnam_haman', name: '함안군' },
      { id: 'gyeongnam_changnyeong', name: '창녕군' },
      { id: 'gyeongnam_goseong', name: '고성군' },
      { id: 'gyeongnam_namhae', name: '남해군' },
      { id: 'gyeongnam_hadong', name: '하동군' },
      { id: 'gyeongnam_sancheong', name: '산청군' },
      { id: 'gyeongnam_hamyang', name: '함양군' },
      { id: 'gyeongnam_geochang', name: '거창군' },
      { id: 'gyeongnam_hapcheon', name: '합천군' }
    ]
  },

  // -------------------------------
  // 제주특별자치도
  // -------------------------------
  {
    id: 'jeju',
    name: '제주',
    children: [
      { id: 'jeju_all', name: '제주 전체' },
      { id: 'jeju_jeju', name: '제주시' },
      { id: 'jeju_seogwipo', name: '서귀포시' }
    ]
  }
];

export default REGIONS;
