chrome.browserAction.onClicked.addListener(function(tab) {
    if (localStorage['unread_notification_count']) {
        chrome.tabs.create({ url: 'http://ruby-china.org/notifications' }); 
        localStorage['unread_notification_count'] = '';
    } else {
        chrome.tabs.create({ url: 'http://ruby-china.org/' }); 
    }

    updateUnreadCount();
});

function updateUnreadCount() {
    chrome.browserAction.setBadgeText({ text: localStorage['unread_notification_count'] || '' });
}

function checkNewNotifications(alarmInfo) {
    console.log('Checking ruby china notifications...');
    $.get('http://ruby-china.org/wiki/about', function(content) {
        var unread_count = parseInt($(content).find("#user_notifications_count .badge").text());
        console.log('Fetched ' + unread_count + ' notifications');
        localStorage['unread_notification_count'] = unread_count || '';
        updateUnreadCount();
    });
}

function createNotificationAlarms() {
    // 默认的通知读取间隔为3分钟
    chrome.storage.sync.get({ 'option.fetch_duration': 3 }, function(items) {
        chrome.alarms.create('notifications', { periodInMinutes: items['option.fetch_duration'] });
        console.log('Alarm notification created with period in ' + items['option.fetch_duration'] + ' minutes.');
    });
}

// Event Bindings
chrome.runtime.onInstalled.addListener(createNotificationAlarms);
chrome.alarms.onAlarm.addListener(checkNewNotifications);
chrome.storage.onChanged.addListener(function(changes) {
    if ('option.fetch_duration' in changes) {
        createNotificationAlarms();
    }
});
