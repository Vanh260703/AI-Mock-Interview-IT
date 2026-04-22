const User = require('../models/user.model');

const SEED_USERS = [
  // ─── Frontend ───────────────────────────────────────────────────────────────
  {
    username: 'minh_fe',
    email: 'minh.fe@aimock.local',
    gender: 'male',
    target: 'FE',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh_fe',
  },
  {
    username: 'linh_react',
    email: 'linh.react@aimock.local',
    gender: 'female',
    target: 'FE',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh_react',
  },
  {
    username: 'tuan_vue',
    email: 'tuan.vue@aimock.local',
    gender: 'male',
    target: 'FE',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan_vue',
  },
  {
    username: 'hoa_frontend',
    email: 'hoa.frontend@aimock.local',
    gender: 'female',
    target: 'FE',
    careerLevel: 'fresher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa_frontend',
  },
  // ─── Backend ────────────────────────────────────────────────────────────────
  {
    username: 'nam_be',
    email: 'nam.be@aimock.local',
    gender: 'male',
    target: 'BE',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam_be',
  },
  {
    username: 'phuong_node',
    email: 'phuong.node@aimock.local',
    gender: 'female',
    target: 'BE',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phuong_node',
  },
  {
    username: 'khoa_java',
    email: 'khoa.java@aimock.local',
    gender: 'male',
    target: 'BE',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khoa_java',
  },
  {
    username: 'thu_python',
    email: 'thu.python@aimock.local',
    gender: 'female',
    target: 'BE',
    careerLevel: 'fresher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu_python',
  },
  {
    username: 'dat_golang',
    email: 'dat.golang@aimock.local',
    gender: 'male',
    target: 'BE',
    careerLevel: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dat_golang',
  },
  // ─── Fullstack ──────────────────────────────────────────────────────────────
  {
    username: 'an_fullstack',
    email: 'an.fullstack@aimock.local',
    gender: 'male',
    target: 'FS',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=an_fullstack',
  },
  {
    username: 'mai_fs',
    email: 'mai.fs@aimock.local',
    gender: 'female',
    target: 'FS',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai_fs',
  },
  {
    username: 'bao_mern',
    email: 'bao.mern@aimock.local',
    gender: 'male',
    target: 'FS',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bao_mern',
  },
  // ─── DevOps ─────────────────────────────────────────────────────────────────
  {
    username: 'hung_devops',
    email: 'hung.devops@aimock.local',
    gender: 'male',
    target: 'DevOps',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung_devops',
  },
  {
    username: 'van_cloud',
    email: 'van.cloud@aimock.local',
    gender: 'male',
    target: 'DevOps',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=van_cloud',
  },
  {
    username: 'yen_k8s',
    email: 'yen.k8s@aimock.local',
    gender: 'female',
    target: 'DevOps',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yen_k8s',
  },
  // ─── Mobile ─────────────────────────────────────────────────────────────────
  {
    username: 'duc_mobile',
    email: 'duc.mobile@aimock.local',
    gender: 'male',
    target: 'Mobile',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc_mobile',
  },
  {
    username: 'nga_flutter',
    email: 'nga.flutter@aimock.local',
    gender: 'female',
    target: 'Mobile',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nga_flutter',
  },
  {
    username: 'long_ios',
    email: 'long.ios@aimock.local',
    gender: 'male',
    target: 'Mobile',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=long_ios',
  },
  {
    username: 'hanh_android',
    email: 'hanh.android@aimock.local',
    gender: 'female',
    target: 'Mobile',
    careerLevel: 'fresher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hanh_android',
  },
  // ─── Data ───────────────────────────────────────────────────────────────────
  {
    username: 'trung_data',
    email: 'trung.data@aimock.local',
    gender: 'male',
    target: 'Data',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trung_data',
  },
  {
    username: 'lan_ml',
    email: 'lan.ml@aimock.local',
    gender: 'female',
    target: 'Data',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan_ml',
  },
  {
    username: 'son_analyst',
    email: 'son.analyst@aimock.local',
    gender: 'male',
    target: 'Data',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=son_analyst',
  },
  {
    username: 'thao_bi',
    email: 'thao.bi@aimock.local',
    gender: 'female',
    target: 'Data',
    careerLevel: 'fresher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thao_bi',
  },
  // ─── Security ───────────────────────────────────────────────────────────────
  {
    username: 'quang_sec',
    email: 'quang.sec@aimock.local',
    gender: 'male',
    target: 'Security',
    careerLevel: 'senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quang_sec',
  },
  {
    username: 'nhi_pentest',
    email: 'nhi.pentest@aimock.local',
    gender: 'female',
    target: 'Security',
    careerLevel: 'middle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nhi_pentest',
  },
  {
    username: 'phuc_soc',
    email: 'phuc.soc@aimock.local',
    gender: 'male',
    target: 'Security',
    careerLevel: 'junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phuc_soc',
  },
  // ─── Intern / Fresher mix ───────────────────────────────────────────────────
  {
    username: 'khanh_intern',
    email: 'khanh.intern@aimock.local',
    gender: 'male',
    target: 'FE',
    careerLevel: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khanh_intern',
  },
  {
    username: 'thi_intern',
    email: 'thi.intern@aimock.local',
    gender: 'female',
    target: 'BE',
    careerLevel: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thi_intern',
  },
  {
    username: 'viet_fresher',
    email: 'viet.fresher@aimock.local',
    gender: 'male',
    target: 'FS',
    careerLevel: 'fresher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viet_fresher',
  },
  {
    username: 'uyen_fresher',
    email: 'uyen.fresher@aimock.local',
    gender: 'female',
    target: 'Data',
    careerLevel: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=uyen_fresher',
  },
];

const DEFAULT_PASSWORD = 'User@123456';

const seedUsers = async () => {
  try {
    const existingEmails = await User.find({
      email: { $in: SEED_USERS.map((u) => u.email) },
    }).distinct('email');

    const toCreate = SEED_USERS.filter((u) => !existingEmails.includes(u.email));
    if (toCreate.length === 0) {
      console.log('[Seeder] Users already seeded — skipping');
      return;
    }

    // Tạo từng user để pre-save hook hash password chạy đúng
    for (const data of toCreate) {
      await User.create({
        ...data,
        password: DEFAULT_PASSWORD,
        isEmailVerified: true,
        role: 'user',
      });
    }

    console.log(`[Seeder] Created ${toCreate.length} seed users — password: ${DEFAULT_PASSWORD}`);
  } catch (err) {
    console.error('[Seeder] Failed to seed users:', err.message);
  }
};

module.exports = seedUsers;
