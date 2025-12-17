/**
 * 지역 데이터 - 대한민국 전국 시군구
 * 백엔드 job_region 필드와 매핑
 */

export const regions = {
  seoul: {
    label: "서울",
    subRegions: [
      { value: "seoul_gangnam", label: "강남구" },
      { value: "seoul_gangdong", label: "강동구" },
      { value: "seoul_gangbuk", label: "강북구" },
      { value: "seoul_gangseo", label: "강서구" },
      { value: "seoul_gwanak", label: "관악구" },
      { value: "seoul_gwangjin", label: "광진구" },
      { value: "seoul_guro", label: "구로구" },
      { value: "seoul_geumcheon", label: "금천구" },
      { value: "seoul_nowon", label: "노원구" },
      { value: "seoul_dobong", label: "도봉구" },
      { value: "seoul_dongdaemun", label: "동대문구" },
      { value: "seoul_dongjak", label: "동작구" },
      { value: "seoul_mapo", label: "마포구" },
      { value: "seoul_seodaemun", label: "서대문구" },
      { value: "seoul_seocho", label: "서초구" },
      { value: "seoul_seongdong", label: "성동구" },
      { value: "seoul_seongbuk", label: "성북구" },
      { value: "seoul_songpa", label: "송파구" },
      { value: "seoul_yangcheon", label: "양천구" },
      { value: "seoul_yeongdeungpo", label: "영등포구" },
      { value: "seoul_yongsan", label: "용산구" },
      { value: "seoul_eunpyeong", label: "은평구" },
      { value: "seoul_jongno", label: "종로구" },
      { value: "seoul_jung", label: "중구" },
      { value: "seoul_jungnang", label: "중랑구" },
    ],
  },
  gyeonggi: {
    label: "경기",
    subRegions: [
      { value: "gyeonggi_suwon", label: "수원시" },
      { value: "gyeonggi_seongnam", label: "성남시" },
      { value: "gyeonggi_goyang", label: "고양시" },
      { value: "gyeonggi_yongin", label: "용인시" },
      { value: "gyeonggi_bucheon", label: "부천시" },
      { value: "gyeonggi_ansan", label: "안산시" },
      { value: "gyeonggi_anyang", label: "안양시" },
      { value: "gyeonggi_namyangju", label: "남양주시" },
      { value: "gyeonggi_hwaseong", label: "화성시" },
      { value: "gyeonggi_pyeongtaek", label: "평택시" },
      { value: "gyeonggi_uijeongbu", label: "의정부시" },
      { value: "gyeonggi_siheung", label: "시흥시" },
      { value: "gyeonggi_paju", label: "파주시" },
      { value: "gyeonggi_gimpo", label: "김포시" },
      { value: "gyeonggi_gwangmyeong", label: "광명시" },
      { value: "gyeonggi_gwangju", label: "광주시" },
      { value: "gyeonggi_gunpo", label: "군포시" },
      { value: "gyeonggi_hanam", label: "하남시" },
      { value: "gyeonggi_osan", label: "오산시" },
      { value: "gyeonggi_icheon", label: "이천시" },
      { value: "gyeonggi_anseong", label: "안성시" },
      { value: "gyeonggi_uiwang", label: "의왕시" },
      { value: "gyeonggi_yangju", label: "양주시" },
      { value: "gyeonggi_pocheon", label: "포천시" },
      { value: "gyeonggi_yeoju", label: "여주시" },
      { value: "gyeonggi_dongducheon", label: "동두천시" },
      { value: "gyeonggi_guri", label: "구리시" },
      { value: "gyeonggi_gwacheon", label: "과천시" },
      { value: "gyeonggi_yangpyeong", label: "양평군" },
      { value: "gyeonggi_gapyeong", label: "가평군" },
      { value: "gyeonggi_yeoncheon", label: "연천군" },
    ],
  },
  incheon: {
    label: "인천",
    subRegions: [
      { value: "incheon_jung", label: "중구" },
      { value: "incheon_dong", label: "동구" },
      { value: "incheon_michuhol", label: "미추홀구" },
      { value: "incheon_yeonsu", label: "연수구" },
      { value: "incheon_namdong", label: "남동구" },
      { value: "incheon_bupyeong", label: "부평구" },
      { value: "incheon_gyeyang", label: "계양구" },
      { value: "incheon_seo", label: "서구" },
      { value: "incheon_ganghwa", label: "강화군" },
      { value: "incheon_ongjin", label: "옹진군" },
    ],
  },
  busan: {
    label: "부산",
    subRegions: [
      { value: "busan_jung", label: "중구" },
      { value: "busan_seo", label: "서구" },
      { value: "busan_dong", label: "동구" },
      { value: "busan_yeongdo", label: "영도구" },
      { value: "busan_busanjin", label: "부산진구" },
      { value: "busan_dongnae", label: "동래구" },
      { value: "busan_nam", label: "남구" },
      { value: "busan_buk", label: "북구" },
      { value: "busan_haeundae", label: "해운대구" },
      { value: "busan_saha", label: "사하구" },
      { value: "busan_geumjeong", label: "금정구" },
      { value: "busan_gangseo", label: "강서구" },
      { value: "busan_yeonje", label: "연제구" },
      { value: "busan_suyeong", label: "수영구" },
      { value: "busan_sasang", label: "사상구" },
      { value: "busan_gijang", label: "기장군" },
    ],
  },
  daegu: {
    label: "대구",
    subRegions: [
      { value: "daegu_jung", label: "중구" },
      { value: "daegu_dong", label: "동구" },
      { value: "daegu_seo", label: "서구" },
      { value: "daegu_nam", label: "남구" },
      { value: "daegu_buk", label: "북구" },
      { value: "daegu_suseong", label: "수성구" },
      { value: "daegu_dalseo", label: "달서구" },
      { value: "daegu_dalseong", label: "달성군" },
      { value: "daegu_gunwi", label: "군위군" },
    ],
  },
  gwangju: {
    label: "광주",
    subRegions: [
      { value: "gwangju_dong", label: "동구" },
      { value: "gwangju_seo", label: "서구" },
      { value: "gwangju_nam", label: "남구" },
      { value: "gwangju_buk", label: "북구" },
      { value: "gwangju_gwangsan", label: "광산구" },
    ],
  },
  daejeon: {
    label: "대전",
    subRegions: [
      { value: "daejeon_dong", label: "동구" },
      { value: "daejeon_jung", label: "중구" },
      { value: "daejeon_seo", label: "서구" },
      { value: "daejeon_yuseong", label: "유성구" },
      { value: "daejeon_daedeok", label: "대덕구" },
    ],
  },
  ulsan: {
    label: "울산",
    subRegions: [
      { value: "ulsan_jung", label: "중구" },
      { value: "ulsan_nam", label: "남구" },
      { value: "ulsan_dong", label: "동구" },
      { value: "ulsan_buk", label: "북구" },
      { value: "ulsan_ulju", label: "울주군" },
    ],
  },
  sejong: {
    label: "세종",
    subRegions: [{ value: "sejong_all", label: "세종시" }],
  },
  gangwon: {
    label: "강원",
    subRegions: [
      { value: "gangwon_chuncheon", label: "춘천시" },
      { value: "gangwon_wonju", label: "원주시" },
      { value: "gangwon_gangneung", label: "강릉시" },
      { value: "gangwon_donghae", label: "동해시" },
      { value: "gangwon_taebaek", label: "태백시" },
      { value: "gangwon_sokcho", label: "속초시" },
      { value: "gangwon_samcheok", label: "삼척시" },
      { value: "gangwon_hongcheon", label: "홍천군" },
      { value: "gangwon_hoengseong", label: "횡성군" },
      { value: "gangwon_yeongwol", label: "영월군" },
      { value: "gangwon_pyeongchang", label: "평창군" },
      { value: "gangwon_jeongseon", label: "정선군" },
      { value: "gangwon_cheorwon", label: "철원군" },
      { value: "gangwon_hwacheon", label: "화천군" },
      { value: "gangwon_yanggu", label: "양구군" },
      { value: "gangwon_inje", label: "인제군" },
      { value: "gangwon_goseong", label: "고성군" },
      { value: "gangwon_yangyang", label: "양양군" },
    ],
  },
  chungbuk: {
    label: "충북",
    subRegions: [
      { value: "chungbuk_cheongju", label: "청주시" },
      { value: "chungbuk_chungju", label: "충주시" },
      { value: "chungbuk_jecheon", label: "제천시" },
      { value: "chungbuk_boeun", label: "보은군" },
      { value: "chungbuk_okcheon", label: "옥천군" },
      { value: "chungbuk_yeongdong", label: "영동군" },
      { value: "chungbuk_jeungpyeong", label: "증평군" },
      { value: "chungbuk_jincheon", label: "진천군" },
      { value: "chungbuk_goesan", label: "괴산군" },
      { value: "chungbuk_eumseong", label: "음성군" },
      { value: "chungbuk_danyang", label: "단양군" },
    ],
  },
  chungnam: {
    label: "충남",
    subRegions: [
      { value: "chungnam_cheonan", label: "천안시" },
      { value: "chungnam_gongju", label: "공주시" },
      { value: "chungnam_boryeong", label: "보령시" },
      { value: "chungnam_asan", label: "아산시" },
      { value: "chungnam_seosan", label: "서산시" },
      { value: "chungnam_nonsan", label: "논산시" },
      { value: "chungnam_gyeryong", label: "계룡시" },
      { value: "chungnam_dangjin", label: "당진시" },
      { value: "chungnam_geumsan", label: "금산군" },
      { value: "chungnam_buyeo", label: "부여군" },
      { value: "chungnam_seocheon", label: "서천군" },
      { value: "chungnam_cheongyang", label: "청양군" },
      { value: "chungnam_hongseong", label: "홍성군" },
      { value: "chungnam_yesan", label: "예산군" },
      { value: "chungnam_taean", label: "태안군" },
    ],
  },
  jeonbuk: {
    label: "전북",
    subRegions: [
      { value: "jeonbuk_jeonju", label: "전주시" },
      { value: "jeonbuk_gunsan", label: "군산시" },
      { value: "jeonbuk_iksan", label: "익산시" },
      { value: "jeonbuk_jeongeup", label: "정읍시" },
      { value: "jeonbuk_namwon", label: "남원시" },
      { value: "jeonbuk_gimje", label: "김제시" },
      { value: "jeonbuk_wanju", label: "완주군" },
      { value: "jeonbuk_jinan", label: "진안군" },
      { value: "jeonbuk_muju", label: "무주군" },
      { value: "jeonbuk_jangsu", label: "장수군" },
      { value: "jeonbuk_imsil", label: "임실군" },
      { value: "jeonbuk_sunchang", label: "순창군" },
      { value: "jeonbuk_gochang", label: "고창군" },
      { value: "jeonbuk_buan", label: "부안군" },
    ],
  },
  jeonnam: {
    label: "전남",
    subRegions: [
      { value: "jeonnam_mokpo", label: "목포시" },
      { value: "jeonnam_yeosu", label: "여수시" },
      { value: "jeonnam_suncheon", label: "순천시" },
      { value: "jeonnam_naju", label: "나주시" },
      { value: "jeonnam_gwangyang", label: "광양시" },
      { value: "jeonnam_damyang", label: "담양군" },
      { value: "jeonnam_gokseong", label: "곡성군" },
      { value: "jeonnam_gurye", label: "구례군" },
      { value: "jeonnam_goheung", label: "고흥군" },
      { value: "jeonnam_boseong", label: "보성군" },
      { value: "jeonnam_hwasun", label: "화순군" },
      { value: "jeonnam_jangheung", label: "장흥군" },
      { value: "jeonnam_gangjin", label: "강진군" },
      { value: "jeonnam_haenam", label: "해남군" },
      { value: "jeonnam_yeongam", label: "영암군" },
      { value: "jeonnam_muan", label: "무안군" },
      { value: "jeonnam_hampyeong", label: "함평군" },
      { value: "jeonnam_yeonggwang", label: "영광군" },
      { value: "jeonnam_jangseong", label: "장성군" },
      { value: "jeonnam_wando", label: "완도군" },
      { value: "jeonnam_jindo", label: "진도군" },
      { value: "jeonnam_sinan", label: "신안군" },
    ],
  },
  gyeongbuk: {
    label: "경북",
    subRegions: [
      { value: "gyeongbuk_pohang", label: "포항시" },
      { value: "gyeongbuk_gyeongju", label: "경주시" },
      { value: "gyeongbuk_gimcheon", label: "김천시" },
      { value: "gyeongbuk_andong", label: "안동시" },
      { value: "gyeongbuk_gumi", label: "구미시" },
      { value: "gyeongbuk_yeongju", label: "영주시" },
      { value: "gyeongbuk_yeongcheon", label: "영천시" },
      { value: "gyeongbuk_sangju", label: "상주시" },
      { value: "gyeongbuk_mungyeong", label: "문경시" },
      { value: "gyeongbuk_gyeongsan", label: "경산시" },
      { value: "gyeongbuk_uiseong", label: "의성군" },
      { value: "gyeongbuk_cheongsong", label: "청송군" },
      { value: "gyeongbuk_yeongyang", label: "영양군" },
      { value: "gyeongbuk_yeongdeok", label: "영덕군" },
      { value: "gyeongbuk_cheongdo", label: "청도군" },
      { value: "gyeongbuk_goryeong", label: "고령군" },
      { value: "gyeongbuk_seongju", label: "성주군" },
      { value: "gyeongbuk_chilgok", label: "칠곡군" },
      { value: "gyeongbuk_yecheon", label: "예천군" },
      { value: "gyeongbuk_bonghwa", label: "봉화군" },
      { value: "gyeongbuk_uljin", label: "울진군" },
      { value: "gyeongbuk_ulleung", label: "울릉군" },
    ],
  },
  gyeongnam: {
    label: "경남",
    subRegions: [
      { value: "gyeongnam_changwon", label: "창원시" },
      { value: "gyeongnam_jinju", label: "진주시" },
      { value: "gyeongnam_tongyeong", label: "통영시" },
      { value: "gyeongnam_sacheon", label: "사천시" },
      { value: "gyeongnam_gimhae", label: "김해시" },
      { value: "gyeongnam_miryang", label: "밀양시" },
      { value: "gyeongnam_geoje", label: "거제시" },
      { value: "gyeongnam_yangsan", label: "양산시" },
      { value: "gyeongnam_uiryeong", label: "의령군" },
      { value: "gyeongnam_haman", label: "함안군" },
      { value: "gyeongnam_changnyeong", label: "창녕군" },
      { value: "gyeongnam_goseong", label: "고성군" },
      { value: "gyeongnam_namhae", label: "남해군" },
      { value: "gyeongnam_hadong", label: "하동군" },
      { value: "gyeongnam_sancheong", label: "산청군" },
      { value: "gyeongnam_hamyang", label: "함양군" },
      { value: "gyeongnam_geochang", label: "거창군" },
      { value: "gyeongnam_hapcheon", label: "합천군" },
    ],
  },
  jeju: {
    label: "제주",
    subRegions: [
      { value: "jeju_jeju", label: "제주시" },
      { value: "jeju_seogwipo", label: "서귀포시" },
    ],
  },
};

export const flatRegions = Object.entries(regions).flatMap(
  ([mainKey, region]) =>
    region.subRegions.map((sub) => ({
      ...sub,
      mainRegion: mainKey,
      mainLabel: region.label,
      fullLabel: `${region.label} ${sub.label}`,
    }))
);

export const mainRegions = Object.entries(regions).map(([key, region]) => ({
  value: key,
  label: region.label,
}));

export const getRegionLabel = (value) => {
  if (!value) return "지역 미정";
  const region = flatRegions.find((r) => r.value === value);
  return region ? region.fullLabel : value;
};

export const getShortRegionLabel = (value) => {
  if (!value) return "지역 미정";
  const region = flatRegions.find((r) => r.value === value);
  return region ? region.label : value;
};

export const getSubRegions = (mainRegion) => {
  return regions[mainRegion]?.subRegions || [];
};

export const getMainRegion = (value) => {
  const region = flatRegions.find((r) => r.value === value);
  return region?.mainRegion || null;
};

export const getParentRegion = (value) => {
  const region = flatRegions.find((r) => r.value === value);
  if (!region) return null;
  return {
    id: region.mainRegion,
    label: region.mainLabel,
  };
};

export default { regions, flatRegions, mainRegions };
