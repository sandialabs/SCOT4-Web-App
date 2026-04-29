import { h } from 'vue'
import type { IconSet, IconAliases, IconProps } from 'vuetify'

import AC from '@/components/Icons/CountryIcons//AC.vue'
import GM from "@/components/Icons/CountryIcons//GM.vue"
import IT from "@/components/Icons/CountryIcons//IT.vue"
import HU from "@/components/Icons/CountryIcons//HU.vue"
import UA from "@/components/Icons/CountryIcons//UA.vue"
import TN from "@/components/Icons/CountryIcons//TN.vue"
import SA from "@/components/Icons/CountryIcons//SA.vue"
import LK from "@/components/Icons/CountryIcons//LK.vue"
import PE from "@/components/Icons/CountryIcons//PE.vue"
import MM from "@/components/Icons/CountryIcons//MM.vue"
import GB from "@/components/Icons/CountryIcons//GB.vue"
import PN from "@/components/Icons/CountryIcons//PN.vue"
import JM from "@/components/Icons/CountryIcons//JM.vue"
import NE from "@/components/Icons/CountryIcons//NE.vue"
import BI from "@/components/Icons/CountryIcons//BI.vue"
import CX from "@/components/Icons/CountryIcons//CX.vue"
import EH from "@/components/Icons/CountryIcons//EH.vue"
import XK from "@/components/Icons/CountryIcons//XK.vue"
import LY from "@/components/Icons/CountryIcons//LY.vue"
import DE from "@/components/Icons/CountryIcons//DE.vue"
import FO from "@/components/Icons/CountryIcons//FO.vue"
import EA from "@/components/Icons/CountryIcons//EA.vue"
import PK from "@/components/Icons/CountryIcons//PK.vue"
import UM from "@/components/Icons/CountryIcons//UM.vue"
import KY from "@/components/Icons/CountryIcons//KY.vue"
import TR from "@/components/Icons/CountryIcons//TR.vue"
import NZ from "@/components/Icons/CountryIcons//NZ.vue"
import GQ from "@/components/Icons/CountryIcons//GQ.vue"
import IO from "@/components/Icons/CountryIcons//IO.vue"
import BE from "@/components/Icons/CountryIcons//BE.vue"
import DJ from "@/components/Icons/CountryIcons//DJ.vue"
import CI from "@/components/Icons/CountryIcons//CI.vue"
import GN from "@/components/Icons/CountryIcons//GN.vue"
import MQ from "@/components/Icons/CountryIcons//MQ.vue"
import CU from "@/components/Icons/CountryIcons//CU.vue"
import CW from "@/components/Icons/CountryIcons//CW.vue"
import HN from "@/components/Icons/CountryIcons//HN.vue"
import AG from "@/components/Icons/CountryIcons//AG.vue"
import MF from "@/components/Icons/CountryIcons//MF.vue"
import GG from "@/components/Icons/CountryIcons//GG.vue"
import TZ from "@/components/Icons/CountryIcons//TZ.vue"
import TO from "@/components/Icons/CountryIcons//TO.vue"
import ZA from "@/components/Icons/CountryIcons//ZA.vue"
import RE from "@/components/Icons/CountryIcons//RE.vue"
import CM from "@/components/Icons/CountryIcons//CM.vue"
import GI from "@/components/Icons/CountryIcons//GI.vue"
import MA from "@/components/Icons/CountryIcons//MA.vue"
import AT from "@/components/Icons/CountryIcons//AT.vue"
import MN from "@/components/Icons/CountryIcons//MN.vue"
import GA from "@/components/Icons/CountryIcons//GA.vue"
import ST from "@/components/Icons/CountryIcons//ST.vue"
import VN from "@/components/Icons/CountryIcons//VN.vue"
import TL from "@/components/Icons/CountryIcons//TL.vue"
import GD from "@/components/Icons/CountryIcons//GD.vue"
import SY from "@/components/Icons/CountryIcons//SY.vue"
import BM from "@/components/Icons/CountryIcons//BM.vue"
import QA from "@/components/Icons/CountryIcons//QA.vue"
import SI from "@/components/Icons/CountryIcons//SI.vue"
import MR from "@/components/Icons/CountryIcons//MR.vue"
import MW from "@/components/Icons/CountryIcons//MW.vue"
import SH from "@/components/Icons/CountryIcons//SH.vue"
import KR from "@/components/Icons/CountryIcons//KR.vue"
import MT from "@/components/Icons/CountryIcons//MT.vue"
import ME from "@/components/Icons/CountryIcons//ME.vue"
import MH from "@/components/Icons/CountryIcons//MH.vue"
import MC from "@/components/Icons/CountryIcons//MC.vue"
import SZ from "@/components/Icons/CountryIcons//SZ.vue"
import JP from "@/components/Icons/CountryIcons//JP.vue"
import ML from "@/components/Icons/CountryIcons//ML.vue"
import BR from "@/components/Icons/CountryIcons//BR.vue"
import US from "@/components/Icons/CountryIcons//US.vue"
import TD from "@/components/Icons/CountryIcons//TD.vue"
import TA from "@/components/Icons/CountryIcons//TA.vue"
import GF from "@/components/Icons/CountryIcons//GF.vue"
import AU from "@/components/Icons/CountryIcons//AU.vue"
import MP from "@/components/Icons/CountryIcons//MP.vue"
import CP from "@/components/Icons/CountryIcons//CP.vue"
import MS from "@/components/Icons/CountryIcons//MS.vue"
import LT from "@/components/Icons/CountryIcons//LT.vue"
import NF from "@/components/Icons/CountryIcons//NF.vue"
import RO from "@/components/Icons/CountryIcons//RO.vue"
import DK from "@/components/Icons/CountryIcons//DK.vue"
import BZ from "@/components/Icons/CountryIcons//BZ.vue"
import UG from "@/components/Icons/CountryIcons//UG.vue"
import UZ from "@/components/Icons/CountryIcons//UZ.vue"
import VG from "@/components/Icons/CountryIcons//VG.vue"
import YE from "@/components/Icons/CountryIcons//YE.vue"
import EG from "@/components/Icons/CountryIcons//EG.vue"
import TJ from "@/components/Icons/CountryIcons//TJ.vue"
import CF from "@/components/Icons/CountryIcons//CF.vue"
import CK from "@/components/Icons/CountryIcons//CK.vue"
import RW from "@/components/Icons/CountryIcons//RW.vue"
import BW from "@/components/Icons/CountryIcons//BW.vue"
import CH from "@/components/Icons/CountryIcons//CH.vue"
import LV from "@/components/Icons/CountryIcons//LV.vue"
import MD from "@/components/Icons/CountryIcons//MD.vue"
import SM from "@/components/Icons/CountryIcons//SM.vue"
import PA from "@/components/Icons/CountryIcons//PA.vue"
import ES from "@/components/Icons/CountryIcons//ES.vue"
import TC from "@/components/Icons/CountryIcons//TC.vue"
import VE from "@/components/Icons/CountryIcons//VE.vue"
import CC from "@/components/Icons/CountryIcons//CC.vue"
import BD from "@/components/Icons/CountryIcons//BD.vue"
import HK from "@/components/Icons/CountryIcons//HK.vue"
import IR from "@/components/Icons/CountryIcons//IR.vue"
import SD from "@/components/Icons/CountryIcons//SD.vue"
import CD from "@/components/Icons/CountryIcons//CD.vue"
import NL from "@/components/Icons/CountryIcons//NL.vue"
import WS from "@/components/Icons/CountryIcons//WS.vue"
import CZ from "@/components/Icons/CountryIcons//CZ.vue"
import ZM from "@/components/Icons/CountryIcons//ZM.vue"
import KN from "@/components/Icons/CountryIcons//KN.vue"
import WF from "@/components/Icons/CountryIcons//WF.vue"
import TG from "@/components/Icons/CountryIcons//TG.vue"
import NU from "@/components/Icons/CountryIcons//NU.vue"
import CL from "@/components/Icons/CountryIcons//CL.vue"
import MO from "@/components/Icons/CountryIcons//MO.vue"
import FJ from "@/components/Icons/CountryIcons//FJ.vue"
import LS from "@/components/Icons/CountryIcons//LS.vue"
import BF from "@/components/Icons/CountryIcons//BF.vue"
import GW from "@/components/Icons/CountryIcons//GW.vue"
import FK from "@/components/Icons/CountryIcons//FK.vue"
import PW from "@/components/Icons/CountryIcons//PW.vue"
import SL from "@/components/Icons/CountryIcons//SL.vue"
import BT from "@/components/Icons/CountryIcons//BT.vue"
import BG from "@/components/Icons/CountryIcons//BG.vue"
import AW from "@/components/Icons/CountryIcons//AW.vue"
import MU from "@/components/Icons/CountryIcons//MU.vue"
import GR from "@/components/Icons/CountryIcons//GR.vue"
import DO from "@/components/Icons/CountryIcons//DO.vue"
import TW from "@/components/Icons/CountryIcons//TW.vue"
import GY from "@/components/Icons/CountryIcons//GY.vue"
import KW from "@/components/Icons/CountryIcons//KW.vue"
import MV from "@/components/Icons/CountryIcons//MV.vue"
import AO from "@/components/Icons/CountryIcons//AO.vue"
import CN from "@/components/Icons/CountryIcons//CN.vue"
import SN from "@/components/Icons/CountryIcons//SN.vue"
import SK from "@/components/Icons/CountryIcons//SK.vue"
import AL from "@/components/Icons/CountryIcons//AL.vue"
import FI from "@/components/Icons/CountryIcons//FI.vue"
import GU from "@/components/Icons/CountryIcons//GU.vue"
import VC from "@/components/Icons/CountryIcons//VC.vue"
import MX from "@/components/Icons/CountryIcons//MX.vue"
import DG from "@/components/Icons/CountryIcons//DG.vue"
import GE from "@/components/Icons/CountryIcons//GE.vue"
import FM from "@/components/Icons/CountryIcons//FM.vue"
import BY from "@/components/Icons/CountryIcons//BY.vue"
import EC from "@/components/Icons/CountryIcons//EC.vue"
import NG from "@/components/Icons/CountryIcons//NG.vue"
import HT from "@/components/Icons/CountryIcons//HT.vue"
import MZ from "@/components/Icons/CountryIcons//MZ.vue"
import DZ from "@/components/Icons/CountryIcons//DZ.vue"
import ZW from "@/components/Icons/CountryIcons//ZW.vue"
import BH from "@/components/Icons/CountryIcons//BH.vue"
import GH from "@/components/Icons/CountryIcons//GH.vue"
import SS from "@/components/Icons/CountryIcons//SS.vue"
import PL from "@/components/Icons/CountryIcons//PL.vue"
import IL from "@/components/Icons/CountryIcons//IL.vue"
import LU from "@/components/Icons/CountryIcons//LU.vue"
import TH from "@/components/Icons/CountryIcons//TH.vue"
import PG from "@/components/Icons/CountryIcons//PG.vue"
import JE from "@/components/Icons/CountryIcons//JE.vue"
import CG from "@/components/Icons/CountryIcons//CG.vue"
import MG from "@/components/Icons/CountryIcons//MG.vue"
import VU from "@/components/Icons/CountryIcons//VU.vue"
import PF from "@/components/Icons/CountryIcons//PF.vue"
import PR from "@/components/Icons/CountryIcons//PR.vue"
import KG from "@/components/Icons/CountryIcons//KG.vue"
import JO from "@/components/Icons/CountryIcons//JO.vue"
import LA from "@/components/Icons/CountryIcons//LA.vue"
import MY from "@/components/Icons/CountryIcons//MY.vue"
import TK from "@/components/Icons/CountryIcons//TK.vue"
import SB from "@/components/Icons/CountryIcons//SB.vue"
import TF from "@/components/Icons/CountryIcons//TF.vue"
import AS from "@/components/Icons/CountryIcons//AS.vue"
import NA from "@/components/Icons/CountryIcons//NA.vue"
import BB from "@/components/Icons/CountryIcons//BB.vue"
import SE from "@/components/Icons/CountryIcons//SE.vue"
import DM from "@/components/Icons/CountryIcons//DM.vue"
import CO from "@/components/Icons/CountryIcons//CO.vue"
import XX from "@/components/Icons/CountryIcons//XX.vue"
import HM from "@/components/Icons/CountryIcons//HM.vue"
import EE from "@/components/Icons/CountryIcons//EE.vue"
import ET from "@/components/Icons/CountryIcons//ET.vue"
import BV from "@/components/Icons/CountryIcons//BV.vue"
import NC from "@/components/Icons/CountryIcons//NC.vue"
import IM from "@/components/Icons/CountryIcons//IM.vue"
import KI from "@/components/Icons/CountryIcons//KI.vue"
import AM from "@/components/Icons/CountryIcons//AM.vue"
import IS from "@/components/Icons/CountryIcons//IS.vue"
import IC from "@/components/Icons/CountryIcons//IC.vue"
import SV from "@/components/Icons/CountryIcons//SV.vue"
import NI from "@/components/Icons/CountryIcons//NI.vue"
import IQ from "@/components/Icons/CountryIcons//IQ.vue"
import AX from "@/components/Icons/CountryIcons//AX.vue"
import UY from "@/components/Icons/CountryIcons//UY.vue"
import BS from "@/components/Icons/CountryIcons//BS.vue"
import NP from "@/components/Icons/CountryIcons//NP.vue"
import NO from "@/components/Icons/CountryIcons//NO.vue"
import EU from "@/components/Icons/CountryIcons//EU.vue"
import NR from "@/components/Icons/CountryIcons//NR.vue"
import AZ from "@/components/Icons/CountryIcons//AZ.vue"
import SR from "@/components/Icons/CountryIcons//SR.vue"
import AF from "@/components/Icons/CountryIcons//AF.vue"
import GT from "@/components/Icons/CountryIcons//GT.vue"
import VA from "@/components/Icons/CountryIcons//VA.vue"
import CV from "@/components/Icons/CountryIcons//CV.vue"
import AE from "@/components/Icons/CountryIcons//AE.vue"
import HR from "@/components/Icons/CountryIcons//HR.vue"
import PS from "@/components/Icons/CountryIcons//PS.vue"
import IN from "@/components/Icons/CountryIcons//IN.vue"
import VI from "@/components/Icons/CountryIcons//VI.vue"
import LR from "@/components/Icons/CountryIcons//LR.vue"
import SX from "@/components/Icons/CountryIcons//SX.vue"
import SG from "@/components/Icons/CountryIcons//SG.vue"
import OM from "@/components/Icons/CountryIcons//OM.vue"
import BO from "@/components/Icons/CountryIcons//BO.vue"
import IE from "@/components/Icons/CountryIcons//IE.vue"
import TM from "@/components/Icons/CountryIcons//TM.vue"
import AR from "@/components/Icons/CountryIcons//AR.vue"
import AI from "@/components/Icons/CountryIcons//AI.vue"
import KH from "@/components/Icons/CountryIcons//KH.vue"
import LI from "@/components/Icons/CountryIcons//LI.vue"
import KP from "@/components/Icons/CountryIcons//KP.vue"
import BA from "@/components/Icons/CountryIcons//BA.vue"
import PH from "@/components/Icons/CountryIcons//PH.vue"
import CY from "@/components/Icons/CountryIcons//CY.vue"
import AQ from "@/components/Icons/CountryIcons//AQ.vue"
import YT from "@/components/Icons/CountryIcons//YT.vue"
import TT from "@/components/Icons/CountryIcons//TT.vue"
import BJ from "@/components/Icons/CountryIcons//BJ.vue"
import FR from "@/components/Icons/CountryIcons//FR.vue"
import RS from "@/components/Icons/CountryIcons//RS.vue"
import SO from "@/components/Icons/CountryIcons//SO.vue"
import BN from "@/components/Icons/CountryIcons//BN.vue"
import LC from "@/components/Icons/CountryIcons//LC.vue"
import BL from "@/components/Icons/CountryIcons//BL.vue"
import LB from "@/components/Icons/CountryIcons//LB.vue"
import PY from "@/components/Icons/CountryIcons//PY.vue"
import MK from "@/components/Icons/CountryIcons//MK.vue"
import PT from "@/components/Icons/CountryIcons//PT.vue"
import KM from "@/components/Icons/CountryIcons//KM.vue"
import KZ from "@/components/Icons/CountryIcons//KZ.vue"
import PM from "@/components/Icons/CountryIcons//PM.vue"
import BQ from "@/components/Icons/CountryIcons//BQ.vue"
import GL from "@/components/Icons/CountryIcons//GL.vue"
import ID from "@/components/Icons/CountryIcons//ID.vue"
import RU from "@/components/Icons/CountryIcons//RU.vue"
import GS from "@/components/Icons/CountryIcons//GS.vue"
import KE from "@/components/Icons/CountryIcons//KE.vue"
import TV from "@/components/Icons/CountryIcons//TV.vue"
import SC from "@/components/Icons/CountryIcons//SC.vue"
import AD from "@/components/Icons/CountryIcons//AD.vue"
import UN from "@/components/Icons/CountryIcons//UN.vue"
import SJ from "@/components/Icons/CountryIcons//SJ.vue"
import CA from "@/components/Icons/CountryIcons//CA.vue"
import ER from "@/components/Icons/CountryIcons//ER.vue"
import GP from "@/components/Icons/CountryIcons//GP.vue"
import CR from "@/components/Icons/CountryIcons//CR.vue"
import ScannerIcon from "@/components/Icons/CyberIcons//ScannerIcon.vue"
import ProxyIcon from "@/components/Icons/CyberIcons//ProxyIcon.vue"
import FireWallIcon from "@/components/Icons/CyberIcons//FireWallIcon.vue"
import AnonymousIPIcon from "@/components/Icons/CyberIcons//AnonymousIPIcon.vue"
import SandiaThunderBirdIcon from "@/components/Icons/CyberIcons//SandiaThunderBirdIcon.vue"
import ThreatActorIcon from "@/components/Icons/CyberIcons//ThreatActorIcon.vue"
import ThreatActorInternalIcon from "@/components/Icons/CyberIcons//ThreatActorInternalIcon.vue"
import ThreatActorIconBlue from "@/components/Icons/CyberIcons//ThreatActorIconBlue.vue"
import ThreatActorInternalIconBlue from "@/components/Icons/CyberIcons//ThreatActorInternalIconBlue.vue"
import ThreatActorIconRed from "@/components/Icons/CyberIcons//ThreatActorIconRed.vue"
import ThreatActorInternalIconRed from "@/components/Icons/CyberIcons//ThreatActorInternalIconRed.vue"
import KEVIcon from "@/components/Icons/CyberIcons//KEVIcon.vue"

const aliases: any | IconAliases = {
  undefined: "mdi-help",
  sandia_thunderbird: SandiaThunderBirdIcon,
  anonymous_ip: AnonymousIPIcon,
  firewall: FireWallIcon,
  public_proxy: ProxyIcon,
  scanner: ScannerIcon,
  threat_actor: ThreatActorIcon,
  threat_actor_internal: ThreatActorInternalIcon,
  threat_actor_blue: ThreatActorIconBlue,
  threat_actor_internal_blue: ThreatActorInternalIconBlue,
  threat_actor_red: ThreatActorIconRed,
  threat_actor_internal_red: ThreatActorInternalIconRed,
  kev: KEVIcon,
  gm_flag: GM,
  it_flag: IT,
  hu_flag: HU,
  ua_flag: UA,
  tn_flag: TN,
  sa_flag: SA,
  lk_flag: LK,
  pe_flag: PE,
  mm_flag: MM,
  gb_flag: GB,
  pn_flag: PN,
  jm_flag: JM,
  ne_flag: NE,
  bi_flag: BI,
  cx_flag: CX,
  eh_flag: EH,
  xk_flag: XK,
  ly_flag: LY,
  de_flag: DE,
  fo_flag: FO,
  ea_flag: EA,
  pk_flag: PK,
  um_flag: UM,
  ky_flag: KY,
  tr_flag: TR,
  nz_flag: NZ,
  gq_flag: GQ,
  io_flag: IO,
  be_flag: BE,
  dj_flag: DJ,
  ci_flag: CI,
  gn_flag: GN,
  mq_flag: MQ,
  cu_flag: CU,
  cw_flag: CW,
  hn_flag: HN,
  ag_flag: AG,
  mf_flag: MF,
  gg_flag: GG,
  tz_flag: TZ,
  to_flag: TO,
  za_flag: ZA,
  re_flag: RE,
  cm_flag: CM,
  gi_flag: GI,
  ma_flag: MA,
  at_flag: AT,
  mn_flag: MN,
  ga_flag: GA,
  st_flag: ST,
  vn_flag: VN,
  tl_flag: TL,
  gd_flag: GD,
  sy_flag: SY,
  bm_flag: BM,
  qa_flag: QA,
  si_flag: SI,
  mr_flag: MR,
  mw_flag: MW,
  sh_flag: SH,
  kr_flag: KR,
  mt_flag: MT,
  me_flag: ME,
  mh_flag: MH,
  mc_flag: MC,
  sz_flag: SZ,
  jp_flag: JP,
  ml_flag: ML,
  br_flag: BR,
  us_flag: US,
  td_flag: TD,
  ta_flag: TA,
  gf_flag: GF,
  au_flag: AU,
  mp_flag: MP,
  cp_flag: CP,
  ms_flag: MS,
  lt_flag: LT,
  nf_flag: NF,
  ro_flag: RO,
  dk_flag: DK,
  bz_flag: BZ,
  ug_flag: UG,
  uz_flag: UZ,
  vg_flag: VG,
  ye_flag: YE,
  eg_flag: EG,
  tj_flag: TJ,
  cf_flag: CF,
  ck_flag: CK,
  rw_flag: RW,
  bw_flag: BW,
  ch_flag: CH,
  lv_flag: LV,
  md_flag: MD,
  sm_flag: SM,
  pa_flag: PA,
  es_flag: ES,
  tc_flag: TC,
  ve_flag: VE,
  cc_flag: CC,
  bd_flag: BD,
  hk_flag: HK,
  ir_flag: IR,
  sd_flag: SD,
  cd_flag: CD,
  nl_flag: NL,
  ws_flag: WS,
  cz_flag: CZ,
  zm_flag: ZM,
  kn_flag: KN,
  wf_flag: WF,
  tg_flag: TG,
  nu_flag: NU,
  cl_flag: CL,
  mo_flag: MO,
  fj_flag: FJ,
  ls_flag: LS,
  bf_flag: BF,
  gw_flag: GW,
  fk_flag: FK,
  pw_flag: PW,
  sl_flag: SL,
  bt_flag: BT,
  bg_flag: BG,
  aw_flag: AW,
  mu_flag: MU,
  gr_flag: GR,
  do_flag: DO,
  tw_flag: TW,
  gy_flag: GY,
  kw_flag: KW,
  mv_flag: MV,
  ao_flag: AO,
  cn_flag: CN,
  sn_flag: SN,
  sk_flag: SK,
  al_flag: AL,
  fi_flag: FI,
  gu_flag: GU,
  vc_flag: VC,
  mx_flag: MX,
  dg_flag: DG,
  ge_flag: GE,
  fm_flag: FM,
  by_flag: BY,
  ec_flag: EC,
  ng_flag: NG,
  ht_flag: HT,
  mz_flag: MZ,
  dz_flag: DZ,
  zw_flag: ZW,
  bh_flag: BH,
  gh_flag: GH,
  ss_flag: SS,
  pl_flag: PL,
  il_flag: IL,
  lu_flag: LU,
  th_flag: TH,
  pg_flag: PG,
  je_flag: JE,
  cg_flag: CG,
  mg_flag: MG,
  vu_flag: VU,
  pf_flag: PF,
  pr_flag: PR,
  kg_flag: KG,
  jo_flag: JO,
  la_flag: LA,
  my_flag: MY,
  tk_flag: TK,
  sb_flag: SB,
  tf_flag: TF,
  as_flag: AS,
  na_flag: NA,
  bb_flag: BB,
  se_flag: SE,
  dm_flag: DM,
  co_flag: CO,
  xx_flag: XX,
  hm_flag: HM,
  ee_flag: EE,
  et_flag: ET,
  bv_flag: BV,
  nc_flag: NC,
  im_flag: IM,
  ki_flag: KI,
  am_flag: AM,
  is_flag: IS,
  ic_flag: IC,
  sv_flag: SV,
  ni_flag: NI,
  iq_flag: IQ,
  ax_flag: AX,
  uy_flag: UY,
  bs_flag: BS,
  np_flag: NP,
  no_flag: NO,
  eu_flag: EU,
  nr_flag: NR,
  az_flag: AZ,
  sr_flag: SR,
  af_flag: AF,
  gt_flag: GT,
  va_flag: VA,
  cv_flag: CV,
  ae_flag: AE,
  hr_flag: HR,
  ps_flag: PS,
  in_flag: IN,
  vi_flag: VI,
  lr_flag: LR,
  sx_flag: SX,
  sg_flag: SG,
  om_flag: OM,
  bo_flag: BO,
  ie_flag: IE,
  tm_flag: TM,
  ar_flag: AR,
  ai_flag: AI,
  kh_flag: KH,
  li_flag: LI,
  kp_flag: KP,
  ba_flag: BA,
  ph_flag: PH,
  cy_flag: CY,
  aq_flag: AQ,
  yt_flag: YT,
  tt_flag: TT,
  bj_flag: BJ,
  fr_flag: FR,
  rs_flag: RS,
  so_flag: SO,
  ac_flag: AC,
  bn_flag: BN,
  lc_flag: LC,
  bl_flag: BL,
  lb_flag: LB,
  py_flag: PY,
  mk_flag: MK,
  pt_flag: PT,
  km_flag: KM,
  kz_flag: KZ,
  pm_flag: PM,
  bq_flag: BQ,
  gl_flag: GL,
  id_flag: ID,
  ru_flag: RU,
  gs_flag: GS,
  ke_flag: KE,
  tv_flag: TV,
  sc_flag: SC,
  ad_flag: AD,
  un_flag: UN,
  sj_flag: SJ,
  ca_flag: CA,
  er_flag: ER,
  gp_flag: GP,
  cr_flag: CR,
}

const custom: IconSet = {
  component: (props: IconProps) => h(props),
}

export { aliases, custom }