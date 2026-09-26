// KATALOG JS — Lion Automotive Part
// Supabase-powered catalog
import { getProducts } from './catalog-db.js';

(function () {
  'use strict';

  // =========================
  // STATE
  // =========================
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const ITEMS_PER_PAGE = 12;

  let activeCategory = 'all';
  let activeBrand = 'all';
  let searchQuery = '';
  let sortMode = 'default';

  // =========================
  // DOM REFS
  // =========================
  const grid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('catalog-empty');
  const pagination = document.getElementById('catalog-pagination');
  const resultsCount = document.getElementById('results-count');
  const totalProductsEl = document.getElementById('total-products');

  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  const categoryFilters = document.getElementById('category-filters');
  const brandFilters = document.getElementById('brand-filters');
  const sortSelect = document.getElementById('sort-select');

  const activeFiltersBar = document.getElementById('active-filters');
  const activeFilterTags = document.getElementById('active-filter-tags');
  const clearAllBtn = document.getElementById('clear-all-filters');

  // Modal
  const modalOverlay = document.getElementById('product-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalGrid = document.getElementById('modal-content-grid');

  // Mobile menu
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');
  const closeMenuBtn = document.querySelector('.close-menu');

  // =========================
  // MOBILE MENU
  // =========================
  function openMenu() {
    if (mobileMenu) mobileMenu.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMenu);
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // =========================
  // IMAGE MAP
  // =========================
  const PRODUCT_IMAGE_MAP = {
    "0014": "https://cf.shopee.co.id/file/id-11134207-7rasj-m50unr9kil1y9b",
    "0015": "https://cf.shopee.co.id/file/id-11134207-7rasl-m4y3jh556ute51",
    "0027": "https://cf.shopee.co.id/file/id-11134207-7rase-m4y2s3wkxcrsf6",
    "0028": "https://cf.shopee.co.id/file/id-11134207-7rasl-m4y3jh55b2iq31",
    "0053": "https://cf.shopee.co.id/file/id-11134207-7rase-m50tb034qhc0ae",
    "0055": "https://cf.shopee.co.id/file/id-11134207-7rasi-m4y3cul2iw7s1d",
    "0056": "https://cf.shopee.co.id/file/id-11134207-7rasa-m4y3jh55npkw2c",
    "0059": "https://cf.shopee.co.id/file/id-11134207-7rasd-m4y3jh552n4224",
    "0074": "https://cf.shopee.co.id/file/id-11134207-7rasg-m4y2s3wl1kf1db",
    "0078": "https://cf.shopee.co.id/file/id-11134207-7rasg-m4y3cul2eoigdc",
    "0232": "https://cf.shopee.co.id/file/b2dc4b668a06590852de04954fb1ec0b",
    "0571": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59rvdls1zlubf",
    "0997": "https://cf.shopee.co.id/file/id-11134207-7rask-m50unr9k5xul1a",
    "1974": "https://cf.shopee.co.id/file/224015c2ca7cabcd49ac8e0aa2f2b84b",
    "2110": "https://cf.shopee.co.id/file/id-11134207-7rasf-m5402k4fsi8012",
    "2273": "https://cf.shopee.co.id/file/id-11134207-822wq-mp8ucm00ly4s60",
    "2283": "https://cf.shopee.co.id/file/id-11134207-7rasm-m4zuu89mn36b91",
    "2625": "https://cf.shopee.co.id/file/136012785cbaa23727a4edfca7bd8523",
    "3482": "https://cf.shopee.co.id/file/id-11134207-7rasl-m59rh7hsi0hy06",
    "3488": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59j6x6qeg0292",
    "3489": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59k8tvz8xawde",
    "3490": "https://cf.shopee.co.id/file/id-11134207-7rash-m4vlgbq7io8wee",
    "3493": "https://cf.shopee.co.id/file/4afd2d90e4a33cafa5d16eb4647f30dd",
    "3496": "https://cf.shopee.co.id/file/id-11134207-7rasa-m4zuy8vp3eugdf",
    "3600": "https://cf.shopee.co.id/file/bda5912d6bc01bf0e2402044695ab1df",
    "3751": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59qsmelpxgd99",
    "5023": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59kvtpm2a4z2c",
    "5025": "https://cf.shopee.co.id/file/c86bee1bc469074a7f58e3e7e10a07e9",
    "5026": "https://cf.shopee.co.id/file/ea7e652f8c50bee8658f46842194c27a",
    "5027": "https://cf.shopee.co.id/file/id-11134207-7rask-m59jchfjiuhf1a",
    "5032": "https://cf.shopee.co.id/file/17dd8113478658580f99936981db91ed",
    "5033": "https://cf.shopee.co.id/file/id-11134207-7rash-m59ldfe6js3qae",
    "5034": "https://cf.shopee.co.id/file/72e80691a28ca7f5f3db4a2a0fb49945",
    "5035": "https://cf.shopee.co.id/file/id-11134207-7rasl-m4y4484qapmo0c",
    "5037": "https://cf.shopee.co.id/file/4c5c106622152f8a0a66ff43e2263e4d",
    "5042": "https://cf.shopee.co.id/file/id-11134207-7rase-m59jchfjk96q7c",
    "5043": "https://cf.shopee.co.id/file/id-11134207-7rase-m59ix5skw7py1c",
    "5045": "https://cf.shopee.co.id/file/id-11134207-7rasm-m64sx79lk77m52",
    "5047": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59p87zcnbpi95",
    "5054": "https://cf.shopee.co.id/file/7381b8ba61dd231ae44a5cd2bedf6816",
    "5055": "https://cf.shopee.co.id/file/1cb3cd2d8b9c1221f3a6181d7f153b16",
    "5056": "https://cf.shopee.co.id/file/fc0687db4780f346d92221725f616191",
    "5063": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59k8tvzmz40b0",
    "5065": "https://cf.shopee.co.id/file/id-11134207-7rask-m4zu6s10a1g3ff",
    "5066": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59t4cfkqsiweb",
    "5067": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59q4ayishp975",
    "5069": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59rdsikdy37f4",
    "5086": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59tt48zn0147f",
    "5091": "https://cf.shopee.co.id/file/id-11134207-7rasb-m59tkvaui0nne4",
    "5098": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59ix5skqlg64e",
    "5099": "https://cf.shopee.co.id/file/id-11134207-7rasl-m59tpjy1qyfn91",
    "5102": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59jchfjogr741",
    "5105": "https://cf.shopee.co.id/file/id-11134207-7rasd-m4y4484pwnv7c1",
    "5110": "https://cf.shopee.co.id/file/id-11134207-7rasi-m59ix5sknsbad9",
    "5145": "https://cf.shopee.co.id/file/ac490fa71a8b63cedd04985f97e15921",
    "5246": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59tigust3eqea",
    "5247": "https://cf.shopee.co.id/file/1622c1a8404e28d8cb162c848f3444d3",
    "5248": "https://cf.shopee.co.id/file/0dcbb29700c2f62c01fea119ee7e73d8",
    "5251": "https://cf.shopee.co.id/file/id-11134207-7rasb-m59qhqogqavs56",
    "5253": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59sr9jvuy2046",
    "5262": "https://cf.shopee.co.id/file/id-11134207-7rask-m59rvdlrtk2b3f",
    "5370": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59rvdlrxrwi8f",
    "5371": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59kvtply2fne8",
    "5377": "https://cf.shopee.co.id/file/8e8c7001397f7e25c910cd033a9b303a",
    "5380": "https://cf.shopee.co.id/file/9b69770e6475b62e570950ad132d3feb",
    "5392": "https://cf.shopee.co.id/file/id-11134207-7rase-m59jzefcd043b4",
    "5409": "https://cf.shopee.co.id/file/8013cce4daa4d76a4ec4dea599584235",
    "5463": "https://cf.shopee.co.id/file/id-11134207-7rasm-m55iik8ze80645",
    "5481": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59oqulvrnh9df",
    "5482": "https://cf.shopee.co.id/file/id-11134207-7rasf-m59rh7hsi0h434",
    "5619": "https://cf.shopee.co.id/file/fc96d00808852b0075f566cc686e2c7f",
    "5627": "https://cf.shopee.co.id/file/4a13c2e5015c15e0948973efd9516ef9",
    "5881": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59q9p4edt7a09",
    "5953": "https://cf.shopee.co.id/file/id-11134207-7rasc-m5aujlcrh90o64",
    "5954": "https://cf.shopee.co.id/file/id-11134207-7rasg-m50tb034tac838",
    "5955": "https://cf.shopee.co.id/file/id-11134207-7rasj-m4zw1aoxtjr4e7",
    "5956": "https://cf.shopee.co.id/file/b39269dcf1e3e1d59317cce3b2588c22",
    "5957": "https://cf.shopee.co.id/file/05dc34537da258172b259ce841271b5b",
    "5958": "https://cf.shopee.co.id/file/6be59884c5b242e5990d663e2599eacc",
    "5963": "https://cf.shopee.co.id/file/id-11134207-7rash-m59kvtplwo0212",
    "5969": "https://cf.shopee.co.id/file/id-11134207-7rasb-m4zuy8vp67zcf6",
    "5999": "https://cf.shopee.co.id/file/id-11134207-7rasi-m5ti8r8qdtzqba",
    "6000": "https://cf.shopee.co.id/file/id-11134207-7rasg-m50tb034rvtf99",
    "6016": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59sh198xlzse1",
    "6020": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59qcaxz4jjc97",
    "6027": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59qsmevjwnq4e",
    "6095": "https://cf.shopee.co.id/file/id-11134207-7ras8-m4y4484q53cwcb",
    "6107": "https://cf.shopee.co.id/file/id-11134207-7rasc-m4ztmf1uv1c240",
    "6114": "https://cf.shopee.co.id/file/id-11134207-7rasb-m59igrno6cpf52",
    "6119": "https://cf.shopee.co.id/file/sg-11134201-7ra16-m58de5je0ayo9c",
    "6122": "https://cf.shopee.co.id/file/id-11134207-7rasg-m581o6uo1wb7a5",
    "6123": "https://cf.shopee.co.id/file/id-11134207-7rasf-m59sh199389k03",
    "6124": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59px179j2qg68",
    "6125": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59q9p4egmc673",
    "6127": "https://cf.shopee.co.id/file/id-11134207-7rasb-m59s8yyjtpue86",
    "6128": "https://cf.shopee.co.id/file/sg-11134201-7ra24-m58cha39sv40c3",
    "6130": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59t4cfaslqe6a",
    "6131": "https://cf.shopee.co.id/file/id-11134207-7rasb-m581o6unwa1f23",
    "6132": "https://cf.shopee.co.id/file/id-11134207-7rasl-m59sh198z0lvdf",
    "6134": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59s8yyjmozq1b",
    "6139": "https://cf.shopee.co.id/file/id-11134207-7rase-m59s8yyjv4bhf2",
    "6140": "https://cf.shopee.co.id/file/id-11134207-7rasf-m59rvdm1xd3s43",
    "6141": "https://cf.shopee.co.id/file/id-11134207-7rasm-m59oqulvt23s25",
    "6143": "https://cf.shopee.co.id/file/id-11134207-7rasf-m55iwg7tmvpi34",
    "6148": "https://cf.shopee.co.id/file/645d42abc33bf077634b391ce0906d43",
    "6155": "https://cf.shopee.co.id/file/id-11134207-7rasj-m50tb034up1c84",
    "6203": "https://cf.shopee.co.id/file/8918ab9c6862bf0f0084aa9a0a9ae4d4",
    "6274": "https://cf.shopee.co.id/file/0e44d9a00306ee91cfd69ebf01b74604",
    "6286": "https://cf.shopee.co.id/file/5f0ad08ddda692de298f0c7bc68be631",
    "6287": "https://cf.shopee.co.id/file/id-11134207-7rase-m59sr9jvuxzx96",
    "6288": "https://cf.shopee.co.id/file/id-11134207-7rask-m59rdsik8btfb7",
    "6289": "https://cf.shopee.co.id/file/id-11134207-7ras9-m59pjnood50d70",
    "6290": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59ldfe6wf7qc2",
    "6300": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59rvdlrmj83de",
    "6312": "https://cf.shopee.co.id/file/id-11134207-7rasc-m59tclp41oer88",
    "6331": "https://cf.shopee.co.id/file/id-11134207-7ras9-m4y2s3wl2z1k40",
    "6384": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59lqgy5op9ke0",
    "6421": "https://cf.shopee.co.id/file/id-11134207-7rasl-m59qsmeln4ee25",
    "6424": "https://cf.shopee.co.id/file/id-11134207-7rasm-m59rvdlrpcczf5",
    "6425": "https://cf.shopee.co.id/file/id-11134207-7ras9-m540muzab4t2af",
    "6426": "https://cf.shopee.co.id/file/id-11134207-7rasg-m59oqulw1hjq1f",
    "6431": "https://cf.shopee.co.id/file/id-11134207-7rasl-m59lm9vumsbs18",
    "6441": "https://cf.shopee.co.id/file/id-11134207-7rask-m59jzeeia0cg3f",
    "6472": "https://cf.shopee.co.id/file/id-11134207-7rasg-m55jmw3ir2fa2f",
    "6477": "https://cf.shopee.co.id/file/a12d4bb9bbb81557aea2ddf481e11dc9",
    "6488": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59px179ho60dd",
    "6493": "https://cf.shopee.co.id/file/id-11134207-7rasc-m545vxjxpo2edc",
    "6507": "https://cf.shopee.co.id/file/id-11134207-7rasm-m55jqlj9k6fx35",
    "6514": "https://cf.shopee.co.id/file/c2dfb4a8b2cdd92836adf27c623fa412",
    "6517": "https://cf.shopee.co.id/file/5eec5915eeba9d7fea6628bc53a55711",
    "6521": "https://cf.shopee.co.id/file/81d20f4162122ab3c48b4225498ec1ce",
    "6525": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59oqulw5p92fd",
    "6541": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59lidjrswbc65",
    "6546": "https://cf.shopee.co.id/file/id-11134207-7rasi-m59tpjy1mqqba4",
    "6552": "https://cf.shopee.co.id/file/id-11134207-7rash-m59l6rxnbjl4c8",
    "6554": "https://cf.shopee.co.id/file/id-11134207-7rasg-m59k8tvzhcu8b8",
    "6555": "https://cf.shopee.co.id/file/id-11134207-7rase-m59sh19938b72a",
    "6556": "https://cf.shopee.co.id/file/id-11134207-7ras9-m55m2fajbl3697",
    "6559": "https://cf.shopee.co.id/file/id-11134207-7rash-m558tu1mu2o6a9",
    "6560": "https://cf.shopee.co.id/file/id-11134207-7rask-m59kvtpm6hube7",
    "6564": "https://cf.shopee.co.id/file/id-11134207-7rasg-m59ofmif9q1242",
    "6565": "https://cf.shopee.co.id/file/id-11134207-7rase-m59soafokny896",
    "6570": "https://cf.shopee.co.id/file/id-11134207-7ras9-m57yrc5ls9so84",
    "6574": "https://cf.shopee.co.id/file/id-11134207-7rasa-m59lidjs2qag3e",
    "6615": "https://cf.shopee.co.id/file/id-11134207-7rase-m59t4cfl212ge7",
    "6621": "https://cf.shopee.co.id/file/id-11134207-7rash-m59svx8emw762b",
    "6622": "https://cf.shopee.co.id/file/b06fa86d7aaf17f458470421aa9cb86b",
    "6623": "https://cf.shopee.co.id/file/id-11134207-7rasb-m55lt9h00fly5b",
    "6624": "https://cf.shopee.co.id/file/5a85c044266746f0757d43186c0427b8",
    "6626": "https://cf.shopee.co.id/file/id-11134207-7rask-m57yrc5lwhi073",
    "6657": "https://cf.shopee.co.id/file/id-11134207-7rasd-m59qqa02zzzcc5",
    "6660": "https://cf.shopee.co.id/file/id-11134207-7ras8-m59ix5skp6ug2f",
    "6661": "https://cf.shopee.co.id/file/id-11134207-7rasi-m59ph05sb7gia5",
    "6674": "https://cf.shopee.co.id/file/id-11134207-7rask-m55jqlj9pspp41",
    "6684": "https://cf.shopee.co.id/file/id-11134207-7rasi-m59qhqoguil45d",
    "6736": "https://cf.shopee.co.id/file/id-11134207-7rasl-m55lq14eidig6d",
    "6764": "https://cf.shopee.co.id/file/id-11134207-7rasl-m55lt9gzxmg897",
    "6765": "https://cf.shopee.co.id/file/id-11134207-7rase-m55iwg7tvb4m28",
    "6777": "https://cf.shopee.co.id/file/id-11134207-7rasc-m55ipw0ddgqueb",
    "6778": "https://cf.shopee.co.id/file/id-11134207-7ras9-m55lq14ejs2w1c",
    "6864": "https://cf.shopee.co.id/file/id-11134207-7rasj-m59tkvau86oj31",
    "6927": "https://cf.shopee.co.id/file/id-11134207-7rase-m55hye345wd245",
    "6941": "https://cf.shopee.co.id/file/id-11134207-7ras9-m57yrc5lo29u84",
    "6942": "https://cf.shopee.co.id/file/id-11134207-7rasf-m55iwg7tlh48f2",
    "6954": "https://cf.shopee.co.id/file/id-11134207-7rasj-m55iik8zifpi59",
    "7120": "https://cf.shopee.co.id/file/id-11134207-7rasm-m55ljzh2uu8217",
    "7121": "https://cf.shopee.co.id/file/id-11134207-7rasb-m57yrc5bu30z80",
    "7186": "https://cf.shopee.co.id/file/id-11134207-7rasm-m55l9ddrx7gme3",
    "7187": "https://cf.shopee.co.id/file/id-11134207-7rash-m55l9ddruec6dd",
    "7192": "https://cf.shopee.co.id/file/id-11134207-7rase-m55je3e87ijcaa",
    "7196": "https://cf.shopee.co.id/file/id-11134207-7ras9-m55lt9h01u5k89",
    "7272": "https://cf.shopee.co.id/file/id-11134207-7rasd-m55k9y3yac4340",
    "7273": "https://cf.shopee.co.id/file/id-11134207-7rasb-m55je3e84pj426",
    "7395": "https://cf.shopee.co.id/file/id-11134207-7rasm-m540j4jqq0ea9d",
    "7564": "https://cf.shopee.co.id/file/id-11134207-7rasd-m53ztp2inb8d1a",
    "7723": "https://cf.shopee.co.id/file/id-11134207-7rask-m5402k4fh9ogb2",
    "7725": "https://cf.shopee.co.id/file/id-11134207-7rasf-m53ztp2irixpc5",
    "7974": "https://cf.shopee.co.id/file/id-11134207-7rasf-m4ztmf1upf2a8d",
    "8132": "https://cf.shopee.co.id/file/id-11134207-7rase-m4y4xvhe06iu79",
    "8133": "https://cf.shopee.co.id/file/id-11134207-7ras8-m4y4t5o0jt1v9b",
    "8136": "https://cf.shopee.co.id/file/id-11134207-7rasg-m4y4xvhe06i0b1"
  };

  // =========================
  // LOAD PRODUCTS FROM SUPABASE
  // =========================
  async function loadProducts() {
    try {
      allProducts = await getProducts();

      // Sanitize titles, OEM numbers and apply image fallbacks
      allProducts = allProducts.map(product => {
        let name = product.name || '';
        let partNumber = product.partNumber || '';
        let image = product.image || '';

        // Extract code from product name:
        // (L-2121), (S-5057), etc.
        const codeMatch = name.match(/\((?:L|S)-?([A-Za-z0-9-]+)\)/i);

        if (codeMatch) {
          const codeKey = codeMatch[1];
          partNumber = codeKey;

          const paddedCode = codeKey.padStart(4, '0');

          if (PRODUCT_IMAGE_MAP[paddedCode]) {
            image = PRODUCT_IMAGE_MAP[paddedCode];
          } else if (PRODUCT_IMAGE_MAP[codeKey]) {
            image = PRODUCT_IMAGE_MAP[codeKey];
          }
        } else {
          if (partNumber) {
            const paddedPart = String(partNumber).padStart(4, '0');

            if (PRODUCT_IMAGE_MAP[paddedPart]) {
              image = PRODUCT_IMAGE_MAP[paddedPart];
            } else if (PRODUCT_IMAGE_MAP[partNumber]) {
              image = PRODUCT_IMAGE_MAP[partNumber];
            }
          }

          // If SKU/part number isn't actually in the name,
          // don't show it as an OEM badge.
          if (
            partNumber &&
            !name.toLowerCase().includes(String(partNumber).toLowerCase())
          ) {
            partNumber = '';
          }
        }

        // Remove " - Lower Tank" / " - Upper Tank"
        if (
          /\s*-\s*(Lower\s*Tank|Upper\s*Tank|LowerTank|UpperTank)$/i.test(name)
        ) {
          name = name
            .replace(
              /\s*-\s*(Lower\s*Tank|Upper\s*Tank|LowerTank|UpperTank)$/i,
              ''
            )
            .trim();
        }

        return {
          ...product,
          name,
          partNumber,
          image
        };
      });

      totalProductsEl.textContent = allProducts.length;

      populateBrandFilters();
      applyFilters();

    } catch (err) {
      console.error('Failed to load products from Supabase:', err);

      allProducts = [];
      filteredProducts = [];

      if (totalProductsEl) {
        totalProductsEl.textContent = '0';
      }

      if (resultsCount) {
        resultsCount.textContent = 'Gagal memuat produk';
      }

      if (grid) {
        grid.innerHTML = `
          <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
          ">
            <h3>Gagal Memuat Katalog</h3>
            <p>Terjadi masalah saat mengambil data produk dari database.</p>
            <button
              class="btn-primary"
              onclick="location.reload()"
              style="margin-top:20px;"
            >
              Coba Lagi
            </button>
          </div>
        `;
      }
    }
  }

  // =========================
  // BRAND FILTERS
  // =========================
  function populateBrandFilters() {
    const brands = [
      ...new Set(
        allProducts
          .map(p => p.brand)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b));

    const brandEmojis = {
      Toyota: '🔴',
      Honda: '🔵',
      Nissan: '⚡',
      Hyundai: '🟢',
      Chevrolet: '🟡',
      Suzuki: '🏁',
      Mitsubishi: '💎',
      Daihatsu: '🔵',
      BMW: '🔘'
    };

    brandFilters.innerHTML =
      '<button class="filter-chip active" data-brand="all">Semua Merek</button>';

    const allChip = brandFilters.querySelector('[data-brand="all"]');

    if (allChip) {
      allChip.addEventListener('click', () => setBrandFilter('all'));
    }

    brands.forEach(brand => {
      const chip = document.createElement('button');

      chip.className = 'filter-chip';
      chip.dataset.brand = brand;
      chip.textContent =
        (brandEmojis[brand] || '🔧') + ' ' + brand;

      chip.addEventListener('click', () => {
        setBrandFilter(brand);
      });

      brandFilters.appendChild(chip);
    });
  }

  // =========================
  // HELPERS
  // =========================
  function formatPrice(price) {
    const numericPrice = Number(price) || 0;
    return 'Rp ' + numericPrice.toLocaleString('id-ID');
  }

  function getDiscount(price, originalPrice) {
    const current = Number(price) || 0;
    const original = Number(originalPrice) || 0;

    if (!original || original <= current) {
      return 0;
    }

    return Math.round(
      ((original - current) / original) * 100
    );
  }

  function getStockLabel(stock) {
    const numericStock = Number(stock);

    if (Number.isFinite(numericStock) && numericStock > 0) {
      return `${numericStock} tersedia`;
    }

    return 'Stok habis';
  }

  function getStockStatus(stock) {
    const numericStock = Number(stock);

    if (Number.isFinite(numericStock) && numericStock > 0) {
      return `✅ ${numericStock} tersedia`;
    }

    return '❌ Stok habis';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeJsString(value) {
    return String(value ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');
  }

  // =========================
  // PRODUCT CARD
  // =========================
  function renderProductCard(product) {
    const discount = getDiscount(
      product.price,
      product.originalPrice
    );

    const badgeHTML = product.badge
      ? `<span class="catalog-badge">${escapeHtml(product.badge)}</span>`
      : '';

    const discountHTML = discount > 0
      ? `<span class="catalog-discount">-${discount}%</span>`
      : '';

    const originalPriceHTML =
      product.originalPrice &&
      Number(product.originalPrice) > Number(product.price)
        ? `<span class="catalog-original-price">${formatPrice(product.originalPrice)}</span>`
        : '';

    const ratingHTML = product.rating
      ? `<span class="catalog-rating">⭐ ${escapeHtml(product.rating)}</span>`
      : '';

    const soldHTML = product.soldCount
      ? `<span class="catalog-sold">🔥 ${escapeHtml(product.soldCount)}</span>`
      : '';

    const partNumberHTML = product.partNumber
      ? `<span class="catalog-part-no">OEM: ${escapeHtml(product.partNumber)}</span>`
      : '';

    const shopeeHTML = product.shopeeUrl
      ? `
        <a
          href="${escapeHtml(product.shopeeUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="catalog-btn-shopee"
        >
          🛒 Shopee
        </a>
      `
      : '';

    const stockClass =
      Number(product.stock) > 0
        ? ''
        : ' out-of-stock';

    return `
      <div class="catalog-card${stockClass}" data-id="${product.id}">

        <div
          class="catalog-card-image"
          onclick="openProductModal(${product.id})"
        >
          <img
            src="${escapeHtml(product.image || '')}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            onerror="this.src='https://placehold.co/400x400/2a2a2a/E8A830?text=Lion+Automotive'"
          >

          ${badgeHTML}
          ${discountHTML}
        </div>

        <div class="catalog-card-body">

          <div class="catalog-card-meta">
            <span class="catalog-card-category">
              ${escapeHtml(product.category || '')}
            </span>

            <span class="catalog-card-brand">
              ${escapeHtml(product.brand || '')}
            </span>

            ${partNumberHTML}
          </div>

          <h3
            class="catalog-card-title"
            onclick="openProductModal(${product.id})"
          >
            ${escapeHtml(product.name)}
          </h3>

          <p class="catalog-card-desc">
            ${escapeHtml(product.description || '')}
          </p>

          <div class="catalog-card-stats">
            ${ratingHTML}
            ${soldHTML}
          </div>

          <div class="catalog-card-pricing">
            <span class="catalog-price">
              ${formatPrice(product.price)}
            </span>

            ${originalPriceHTML}
          </div>

          <div class="catalog-card-stock">
            <span class="stock-dot"></span>
            ${getStockLabel(product.stock)}
          </div>

          <div class="catalog-card-actions">

            <button
              class="catalog-btn-detail"
              onclick="openProductModal(${product.id})"
            >
              🔍 Detail
            </button>

            ${shopeeHTML}

            <button
              class="catalog-btn-wa"
              onclick="catalogWhatsApp(
                '${escapeJsString(product.name)}',
                '${escapeJsString(product.partNumber || '')}'
              )"
            >
              💬 Tanya
            </button>

          </div>
        </div>
      </div>
    `;
  }

  // =========================
  // RENDER GRID
  // =========================
  function renderGrid() {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    const end =
      start + ITEMS_PER_PAGE;

    const pageProducts =
      filteredProducts.slice(start, end);

    if (pageProducts.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'flex';
      pagination.innerHTML = '';

      resultsCount.textContent =
        'Tidak ada produk ditemukan';

      return;
    }

    grid.style.display = '';
    emptyState.style.display = 'none';

    grid.innerHTML =
      pageProducts
        .map(renderProductCard)
        .join('');

    resultsCount.textContent =
      `Menampilkan ${start + 1}-${Math.min(
        end,
        filteredProducts.length
      )} dari ${filteredProducts.length} produk`;

    renderPagination();

    requestAnimationFrame(() => {
      grid
        .querySelectorAll('.catalog-card')
        .forEach((card, i) => {

          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';

          setTimeout(() => {
            card.style.transition =
              'opacity 0.4s ease, transform 0.4s ease';

            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 40);
        });
    });
  }

  // =========================
  // PAGINATION
  // =========================
  function renderPagination() {
    const totalPages =
      Math.ceil(
        filteredProducts.length /
        ITEMS_PER_PAGE
      );

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';

    html += `
      <button
        class="page-btn ${currentPage === 1 ? 'disabled' : ''}"
        onclick="goToPage(${currentPage - 1})"
        ${currentPage === 1 ? 'disabled' : ''}
      >
        ← Prev
      </button>
    `;

    const maxVisible = 5;

    let startP =
      Math.max(
        1,
        currentPage -
        Math.floor(maxVisible / 2)
      );

    let endP =
      Math.min(
        totalPages,
        startP + maxVisible - 1
      );

    if (endP - startP < maxVisible - 1) {
      startP =
        Math.max(
          1,
          endP - maxVisible + 1
        );
    }

    if (startP > 1) {
      html += `
        <button
          class="page-btn"
          onclick="goToPage(1)"
        >
          1
        </button>
      `;

      if (startP > 2) {
        html += `<span class="page-dots">...</span>`;
      }
    }

    for (let i = startP; i <= endP; i++) {
      html += `
        <button
          class="page-btn ${i === currentPage ? 'active' : ''}"
          onclick="goToPage(${i})"
        >
          ${i}
        </button>
      `;
    }

    if (endP < totalPages) {

      if (endP < totalPages - 1) {
        html += `<span class="page-dots">...</span>`;
      }

      html += `
        <button
          class="page-btn"
          onclick="goToPage(${totalPages})"
        >
          ${totalPages}
        </button>
      `;
    }

    html += `
      <button
        class="page-btn ${currentPage === totalPages ? 'disabled' : ''}"
        onclick="goToPage(${currentPage + 1})"
        ${currentPage === totalPages ? 'disabled' : ''}
      >
        Next →
      </button>
    `;

    pagination.innerHTML = html;
  }

  // =========================
  // FILTERING
  // =========================
  function applyFilters() {

    filteredProducts =
      allProducts.filter(product => {

        const matchCategory =
          activeCategory === 'all' ||
          product.category === activeCategory;

        const matchBrand =
          activeBrand === 'all' ||
          product.brand === activeBrand;

        const q =
          searchQuery
            .toLowerCase()
            .trim();

        const searchTerms =
          q
            .split(/\s+/)
            .filter(Boolean);

        const targetText = `
          ${product.name || ''}
          ${product.description || ''}
          ${product.brand || ''}
          ${product.category || ''}
          ${product.partNumber || ''}
          ${product.compatibility || ''}
          ${product.sku || ''}
        `.toLowerCase();

        const matchSearch =
          searchTerms.length === 0 ||
          searchTerms.every(term =>
            targetText.includes(term)
          );

        return (
          matchCategory &&
          matchBrand &&
          matchSearch
        );
      });

    // Sorting
    switch (sortMode) {

      case 'price-low':
        filteredProducts.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );
        break;

      case 'price-high':
        filteredProducts.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );
        break;

      case 'name-az':
        filteredProducts.sort(
          (a, b) =>
            String(a.name || '')
              .localeCompare(
                String(b.name || '')
              )
        );
        break;

      case 'discount':
        filteredProducts.sort(
          (a, b) =>
            getDiscount(
              b.price,
              b.originalPrice
            ) -
            getDiscount(
              a.price,
              a.originalPrice
            )
        );
        break;
    }

    currentPage = 1;

    renderGrid();
    updateActiveFiltersBar();
  }

  // =========================
  // ACTIVE FILTER BAR
  // =========================
  function updateActiveFiltersBar() {

    const hasFilters =
      activeCategory !== 'all' ||
      activeBrand !== 'all' ||
      searchQuery;

    activeFiltersBar.style.display =
      hasFilters ? 'flex' : 'none';

    if (!hasFilters) {
      return;
    }

    let tags = '';

    if (activeCategory !== 'all') {
      tags += `
        <span class="filter-tag">
          Kategori: ${escapeHtml(activeCategory)}
          <button onclick="setCategoryFilter('all')">
            ✕
          </button>
        </span>
      `;
    }

    if (activeBrand !== 'all') {
      tags += `
        <span class="filter-tag">
          Merek: ${escapeHtml(activeBrand)}
          <button onclick="setBrandFilter('all')">
            ✕
          </button>
        </span>
      `;
    }

    if (searchQuery) {
      tags += `
        <span class="filter-tag">
          Cari: "${escapeHtml(searchQuery)}"
          <button onclick="clearSearch()">
            ✕
          </button>
        </span>
      `;
    }

    activeFilterTags.innerHTML = tags;
  }

  // =========================
  // FILTER HANDLERS
  // =========================
  function setCategoryFilter(category) {

    activeCategory = category;

    categoryFilters
      .querySelectorAll('.filter-chip')
      .forEach(chip => {
        chip.classList.toggle(
          'active',
          chip.dataset.category === category
        );
      });

    applyFilters();
  }

  function setBrandFilter(brand) {

    activeBrand = brand;

    brandFilters
      .querySelectorAll('.filter-chip')
      .forEach(chip => {
        chip.classList.toggle(
          'active',
          chip.dataset.brand === brand
        );
      });

    applyFilters();
  }

  function clearSearch() {

    searchInput.value = '';
    searchQuery = '';

    searchClear.style.display = 'none';

    applyFilters();
  }

  // =========================
  // PRODUCT MODAL
  // =========================
  window.openProductModal = function (productId) {

    const product =
      allProducts.find(
        p => String(p.id) === String(productId)
      );

    if (!product) {
      return;
    }

    const discount =
      getDiscount(
        product.price,
        product.originalPrice
      );

    const discountHTML =
      discount > 0
        ? `<span class="modal-discount-tag">Hemat ${discount}%</span>`
        : '';

    const originalPriceHTML =
      product.originalPrice &&
      Number(product.originalPrice) >
      Number(product.price)
        ? `
          <span class="modal-original-price">
            ${formatPrice(product.originalPrice)}
          </span>
        `
        : '';

    const shopeeButton =
      product.shopeeUrl
        ? `
          <a
            href="${escapeHtml(product.shopeeUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-shopee-buy"
          >
            🛒 Beli Langsung di Shopee
          </a>
        `
        : '';

    modalGrid.innerHTML = `

      <div class="modal-image-col">

        <div class="modal-image-wrapper">

          <img
            src="${escapeHtml(product.image || '')}"
            alt="${escapeHtml(product.name)}"
            onerror="this.src='https://placehold.co/400x400/2a2a2a/E8A830?text=Lion+Automotive'"
          >

          ${
            product.badge
              ? `
                <span class="modal-badge-tag">
                  ${escapeHtml(product.badge)}
                </span>
              `
              : ''
          }

        </div>

        <div class="modal-store-verify">
          <span>
            Official Shopee Product — Lion Automotive Part
          </span>
        </div>

      </div>

      <div class="modal-info-col">

        <div class="modal-meta-chips">

          <span class="chip-cat">
            ${escapeHtml(product.category || '')}
          </span>

          <span class="chip-brand">
            ${escapeHtml(product.brand || '')}
          </span>

          ${
            product.partNumber
              ? `
                <span class="chip-oem">
                  OEM: ${escapeHtml(product.partNumber)}
                </span>
              `
              : ''
          }

        </div>

        <h2 class="modal-title">
          ${escapeHtml(product.name)}
        </h2>

        <div class="modal-rating-row">

          <span class="modal-rating-star">
            ⭐ ${escapeHtml(product.rating || '4.9')} / 5.0
          </span>

          <span class="modal-divider">•</span>

          <span class="modal-sold-count">
            🔥 ${escapeHtml(product.soldCount || 'Belum ada data')}
          </span>

          <span class="modal-divider">•</span>

          <span class="modal-stock-status">
            ${getStockStatus(product.stock)}
          </span>

        </div>

        <div class="modal-price-box">

          <div class="modal-current-price">
            ${formatPrice(product.price)}
          </div>

          ${originalPriceHTML}

          ${discountHTML}

        </div>

        <div class="modal-section">

          <h4>Deskripsi Produk:</h4>

          <p class="modal-description">
            ${escapeHtml(product.description || 'Tidak ada deskripsi.')}
          </p>

        </div>

        ${
          product.compatibility
            ? `
              <div class="modal-section modal-compatibility-box">

                <h4>
                  🚗 Kompatibilitas Kendaraan:
                </h4>

                <p>
                  ${escapeHtml(product.compatibility)}
                </p>

              </div>
            `
            : ''
        }

        <div class="modal-actions-row">

          ${shopeeButton}

          <button
            class="btn-wa-consult"
            onclick="catalogWhatsApp(
              '${escapeJsString(product.name)}',
              '${escapeJsString(product.partNumber || '')}'
            )"
          >
            💬 Konsultasi via WhatsApp
          </button>

        </div>

      </div>
    `;

    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  // =========================
  // CLOSE MODAL
  // =========================
  window.closeProductModal = function () {

    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener(
      'click',
      window.closeProductModal
    );
  }

  if (modalOverlay) {
    modalOverlay.addEventListener(
      'click',
      event => {
        if (event.target === modalOverlay) {
          window.closeProductModal();
        }
      }
    );
  }

  // =========================
  // PAGINATION GLOBAL
  // =========================
  window.goToPage = function (page) {

    const totalPages =
      Math.ceil(
        filteredProducts.length /
        ITEMS_PER_PAGE
      );

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    currentPage = page;

    renderGrid();

    const filters =
      document.getElementById(
        'catalog-filters'
      );

    if (filters) {
      filters.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // =========================
  // RESET FILTERS
  // =========================
  window.resetFilters = function () {

    activeCategory = 'all';
    activeBrand = 'all';
    searchQuery = '';
    sortMode = 'default';

    searchInput.value = '';
    sortSelect.value = 'default';

    searchClear.style.display = 'none';

    categoryFilters
      .querySelectorAll('.filter-chip')
      .forEach(chip => {
        chip.classList.toggle(
          'active',
          chip.dataset.category === 'all'
        );
      });

    brandFilters
      .querySelectorAll('.filter-chip')
      .forEach(chip => {
        chip.classList.toggle(
          'active',
          chip.dataset.brand === 'all'
        );
      });

    applyFilters();
  };

  // Expose filter functions
  window.setCategoryFilter =
    setCategoryFilter;

  window.setBrandFilter =
    setBrandFilter;

  window.clearSearch =
    clearSearch;

  // =========================
  // WHATSAPP
  // =========================
  window.catalogWhatsApp =
    function (productName, partNumber) {

      let message =
        `Halo Lion Automotive Part, saya ingin menanyakan ketersediaan produk:\n` +
        `- Nama: ${productName}`;

      if (partNumber) {
        message +=
          `\n- Part Number: ${partNumber}`;
      }

      message +=
        `\nBisa minta info stok & kecocokan untuk mobil saya?`;

      const encodedMessage =
        encodeURIComponent(message);

      window.open(
        `https://wa.me/6282388248281?text=${encodedMessage}`,
        '_blank'
      );
    };

  // =========================
  // CATEGORY FILTER EVENTS
  // =========================
  if (categoryFilters) {
    categoryFilters
      .querySelectorAll('.filter-chip')
      .forEach(chip => {

        chip.addEventListener(
          'click',
          () => {
            setCategoryFilter(
              chip.dataset.category
            );
          }
        );

      });
  }

  // =========================
  // SEARCH
  // =========================
  let searchTimeout;

  if (searchInput) {

    searchInput.addEventListener(
      'input',
      () => {

        clearTimeout(searchTimeout);

        searchClear.style.display =
          searchInput.value
            ? 'block'
            : 'none';

        searchTimeout =
          setTimeout(() => {

            searchQuery =
              searchInput.value
                .toLowerCase()
                .trim();

            applyFilters();

          }, 300);
      }
    );
  }

  if (searchClear) {
    searchClear.addEventListener(
      'click',
      clearSearch
    );
  }

  // =========================
  // SORT
  // =========================
  if (sortSelect) {
    sortSelect.addEventListener(
      'change',
      () => {

        sortMode =
          sortSelect.value;

        applyFilters();
      }
    );
  }

  // =========================
  // CLEAR ALL
  // =========================
  if (clearAllBtn) {
    clearAllBtn.addEventListener(
      'click',
      window.resetFilters
    );
  }

  // =========================
  // ESC CLOSE MODAL
  // =========================
  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape' &&
        modalOverlay &&
        modalOverlay.style.display === 'flex'
      ) {
        window.closeProductModal();
      }

    }
  );

  // =========================
  // INIT
  // =========================
  loadProducts();

})();
