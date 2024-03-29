module.exports = class DateHelper {
    resolveFromTimestamp(timestamp) {
        return new Date((timestamp) * 1000)
    }

    resolveCurrentTimestamp() {
        return (new Date()).getTime();
    }

    resolveDBTimestamp(timestamp) {
        let date = new Date(timestamp)
        date.setSeconds(0);
        return date;
    }
}
