import { createAPI } from 'cube-ui'
import Vue from 'vue'
import IdCardInfo from 'components/personInfo/idCardInfo'
import PhoneNumber from 'components/personInfo/phoneNumber'
import PlanName from 'components/personInfo/planName'
import ChangePassword from 'components/personInfo/changePassword'
import ApplyJoinEppo from 'components/eppoTeam/applyJoinEppo'
import SearchResult from 'components/eppoTeam/searchResult'
import EppoName from 'components/eppoTeam/eppoName'
import EppoAppro from 'components/eppoTeam/eppoAppro'
import LeaderOperation from 'components/eppoTeam/leaderOperation'
import PermissTrans from 'components/eppoTeam/permissTrans'
import LookMoreApply from 'components/eppoTeam/lookMoreApply'
import InviteMember from 'components/eppoTeam/inviteMember'
import AddEquipment from 'components/uavPlan/addEquipment'
import EditEquipmentName from 'components/uavPlan/editEquipmentName'
import OrderName from 'components/order/orderName'
import ScreeningTeam from 'components/order/screeningTeam'
import AddAcount from 'components/Qx/addAccount' // 添加千寻账号
// import PromptBox from 'components/promptBox/promptBox'

createAPI(Vue, IdCardInfo)
createAPI(Vue, PhoneNumber)
createAPI(Vue, PlanName)
createAPI(Vue, ChangePassword)
createAPI(Vue, ApplyJoinEppo)
createAPI(Vue, SearchResult)
createAPI(Vue, EppoName)
createAPI(Vue, EppoAppro)
createAPI(Vue, PermissTrans)
createAPI(Vue, LookMoreApply)
createAPI(Vue, InviteMember)
createAPI(Vue, AddEquipment)
createAPI(Vue, EditEquipmentName)
createAPI(Vue, LeaderOperation)
createAPI(Vue, OrderName)
createAPI(Vue, AddAcount)
createAPI(Vue, ScreeningTeam)
// createAPI(Vue, PromptBox)
