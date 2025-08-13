
import { showAlert } from "react-native-customisable-alert";

const showAlertWith = (...params) => {
    showAlert({
        title: params.length > 3 ? params[0] : 'Thông báo',
        message: params.length > 3 ? params[1] : params[0],
        alertType: params.length > 3 ? params[2] : params[1],
        btnLabel: params.length > 3 ? params[3] : params[2]
    })
}
export default {
    showAlertWith
}