import {
    Alert,
    PermissionsAndroid
} from 'react-native';
import { CallCustomAlert } from "../utilies";
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { convertDateToDateTimeStringForExcelFile } from "../utilies/DateTime"
///////////////// XUẤT DỮ LIỆU THỐNG KÊ ///////////////////////////
export const ExportTypeEnum = {
    DKLV: 'DKLV',
    CCTT: 'CCTT', 
}
export const ExportRoleEnum = {
    PV: 'PV',
    BC: 'BC',
    NN: 'NN',
    DB: 'DB',
}

const exportRegisterDataToExcel = async (dataExport, exportRole, exportName) => {
    // debugger
    if (!dataExport) {
        CallCustomAlert.showAlertWith("Không có dữ liệu báo cáo", "error", "OK")
        return
    }
    try {
        let excelData;
        let dataProcessForExcel = [];
        // dữ liệu cần là một mảng các đối tượng với các thuộc tính 'STT', 'Đơn vị báo chí', 'Tổng đơn', 'Chờ phê duyệt', 
        //'Chờ phản hồi','Chờ làm việc','Hủy đăng ký','Hoàn thành'
        // kiểm tra nếu data có chứa trạng thái chờ phê duyệt, tức là đăng ký đó là của pv, cqbc thường trú, ngược lại là phóng viên hoặc cơ quan báo chí vãng lai
        if(dataExport.wait2 != null){
            const lengthOfData = dataExport.wait2.length
            for (let i = 0; i < lengthOfData; i++) { 
                let stt = i + 1
                let title = dataExport.wait2[i].x;
                let wait2 = dataExport.wait2[i].y ? dataExport.wait2[i].y : 0
                let wait3 = dataExport.wait3[i].y ? dataExport.wait3[i].y : 0
                let agree = dataExport.agree[i].y ? dataExport.agree[i].y : 0
                let cancel = dataExport.cancel[i].y ? dataExport.cancel[i].y : 0
                let finish = dataExport.finish[i].y ? dataExport.finish[i].y : 0
                let total = wait2 + wait3 + agree + cancel + finish
                dataProcessForExcel.push({ 'stt': stt, 'title': title, 'total': total, 'wait2': wait2, 'wait3': wait3, 'agree': agree, 'cancel': cancel, 'finish': finish })
            }
    
            excelData = [
                ['STT', exportRole == ExportRoleEnum.PV ? 'Phóng viên' : exportRole == ExportRoleEnum.BC ? 'Đơn vị báo chí' : exportRole == ExportRoleEnum.NN ? 'Đơn vị tiếp nhận' : 'Địa bàn', 'Tổng đơn', 
                'Chờ phê duyệt', 'Chờ phản hồi', 'Chờ làm việc', 'Hủy đăng ký', 'Hoàn thành'],
                ...dataProcessForExcel.map(element => [
                    element.stt,
                    element.title,
                    element.total,
                    element.wait2,
                    element.wait3,
                    element.agree,
                    element.cancel,
                    element.finish
                ])
            ];
        } else {
            const lengthOfData = dataExport.agree.length
            for (let i = 0; i < lengthOfData; i++) { 
                let stt = i + 1
                let title = dataExport.agree[i].x;
                let agree = dataExport.agree[i].y ? dataExport.agree[i].y : 0
                let finish = dataExport.finish[i].y ? dataExport.finish[i].y : 0 
                let cancel = dataExport.cancel[i].y ? dataExport.cancel[i].y : 0 
                let total = agree + cancel + finish
                dataProcessForExcel.push({ 'stt': stt, 'title': title, 'total': total, 'agree': agree, 'finish': finish, 'cancel': cancel })
            }
    
            excelData = [
                ['STT', exportRole == ExportRoleEnum.PV ? 'Phóng viên' : exportRole == ExportRoleEnum.BC ? 'Đơn vị báo chí' : exportRole == ExportRoleEnum.NN ? 'Đơn vị tiếp nhận' : 'Địa bàn', 'Tổng đơn', 
                'Chờ làm việc', 'Hoàn thành', 'Hủy đăng ký'],
                ...dataProcessForExcel.map(element => [
                    element.stt,
                    element.title,
                    element.total, 
                    element.agree,
                    element.finish,
                    element.cancel
                ])
            ];
        }
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Thống kê DKLV');
        const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
        // Save the Excel file
        const currentDate = new Date();
        const roleString = exportRole == ExportRoleEnum.PV ? 'phongvien' : exportRole == ExportRoleEnum.BC ? 'cqbc' : exportRole == ExportRoleEnum.NN ? 'cqnn' : 'diaban'
        const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate); 
        const fileName = `${exportName}_${roleString}_${formattedDate}.xlsx`;
        const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(filePath, wbout, 'ascii');

        Alert.alert(
            'Thông báo',
            'File exported: ' + filePath
            );
        } catch (error) {
          Alert.alert(
            'Thông báo',
            'Error exporting Excel', error
            );
        }
};

const exportRequireDataToExcel = async (dataExport, exportRole, exportName) => {
    // debugger
    if (!dataExport) {
        CallCustomAlert.showAlertWith("Không có dữ liệu báo cáo", "error", "OK")
        return
    }
    try {
        let excelData;
        let dataProcessForExcel = [];
        // dữ liệu cần là một mảng các đối tượng với các thuộc tính 'STT', 'Đơn vị báo chí', 'Tổng đơn', 'Chờ phê duyệt', 
        //'Chờ phản hồi','Chờ làm việc','Hủy đăng ký','Hoàn thành'
        const lengthOfData = dataExport.replied.length
        for (let i = 0; i < lengthOfData; i++) {
            // debugger
            let stt = i + 1
            let title = dataExport.replied[i].x;
            let replied = dataExport.replied[i].y ? dataExport.replied[i].y : 0
            let awaitReply = dataExport.awaitReply[i].y ? dataExport.awaitReply[i].y : 0
            let cancelReply = dataExport.cancelReply[i].y ? dataExport.cancelReply[i].y : 0 
            let total = replied + awaitReply + cancelReply  
            dataProcessForExcel.push({ 'stt': stt, 'title': title, 'total': total, 'replied': replied, 'awaitReply': awaitReply, 'cancelReply': cancelReply })
        }
        // debugger
        excelData = [
            ['STT', exportRole == ExportRoleEnum.PV ? 'Phóng viên' : exportRole == ExportRoleEnum.BC ? 'Đơn vị báo chí' : exportRole == ExportRoleEnum.NN ? 'Đơn vị tiếp nhận' : 'Địa bàn', 
            'Tổng đơn', 'Chờ phản hồi', 'Đã phản hồi', 'Hủy yêu cầu'],
            ...dataProcessForExcel.map(element => [
                element.stt,
                element.title,
                element.total,
                element.awaitReply,
                element.replied,
                element.cancelReply, 
            ])
        ];

        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Thống kê cung cấp thông tin');
        const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

        // Save the Excel file
        const currentDate = new Date();
        const roleString = exportRole == ExportRoleEnum.PV ? 'phongvien' : exportRole == ExportRoleEnum.BC ? 'cqbc' : exportRole == ExportRoleEnum.NN ? 'cqnn' : 'diaban'
        const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate);
        const fileName = `${exportName}_${roleString}_${formattedDate}.xlsx`;
        const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(filePath, wbout, 'ascii');

        Alert.alert(
            'Thông báo',
            'File exported: ' + filePath
            );
        } catch (error) {
          Alert.alert(
            'Thông báo',
            'Error exporting Excel', error
            );
        }
};

const handleExportPress = async (đataToExport, exportType, exportRole, exportName) => {
    // debugger
    try {
        let isPermitedExternalStorage = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (!isPermitedExternalStorage) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission needed',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Ok',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                exportDataToExcel(đataToExport, exportRole); // Use await here to ensure export is completed
                console.log('Permission granted');
            } else {
                console.log('Permission denied');
            }
        } else {
            // debugger
            if (exportType == ExportTypeEnum.DKLV)
                exportRegisterDataToExcel(đataToExport, exportRole, exportName); // Use await here to ensure export is completed
            else exportRequireDataToExcel(đataToExport, exportRole, exportName);
        }
    } catch (e) {
        console.warn('Error while checking permissions:');
        console.log('Error while checking permissions:', e);
    }
};
export default { handleExportPress, ExportTypeEnum, ExportRoleEnum }