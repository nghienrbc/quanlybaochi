import moment from 'moment'
export const convertDateTimeToDateString = (dateTime) => {
    return moment(dateTime).format('DD-MM-YYYY')
}
export const convertDateTimeToTimeString = (dateTime) => {
    return moment(dateTime).format('HH:mm')
}
export const convertDateStringToDate = (dateString) => {
    return moment(dateString).format('DD-MM-YYYY')
}
export const convertDateToDateTimeString = (dateTime) => {//2022-10-20 10:00
    return moment(dateTime).format('DD-MM-YYYY HH:mm')
}
export const convertDateToDateTimeStringForExcelFile = (dateTime) => {//2022-10-20 10:00:00
    return moment(dateTime).format('DD-MM-YYYY HH_mm_ss')
}