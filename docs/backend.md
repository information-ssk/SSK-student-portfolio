code.gs """ const SHEET_ID = '1csUBR9QdvqHEYTiIospBAb5KjuRupIOBJZkBTphCz0U';
const FOLDER_ID = '1kIk_4pcz9DiuoA82K8Fnr8Conq3Y1Dnk';

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getRecords') {
    return getRecords();
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'uploadFile') {
      return uploadFile(e);
    } else if (action === 'saveRecord') {
      return saveRecord(e);
    } else if (action === 'updateRecord') {
      return updateRecord(e);
    } else if (action === 'deleteRecord') {
      return deleteRecord(e);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function uploadFile(e) {
  const fileName = e.parameter.fileName;
  const mimeType = e.parameter.mimeType;
  const base64Data = e.parameter.base64Data;
  
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileUrl = file.getUrl();
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    fileUrl: fileUrl,
    fileId: file.getId()
  })).setMimeType(ContentService.MimeType.JSON);
}

function saveRecord(e) {
  const data = JSON.parse(e.parameter.data);
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('ผลงาน');
  
  if (!sheet) {
    sheet = ss.insertSheet('ผลงาน');
    sheet.appendRow([
      'timestamp', 'recordedBy', 'recordedDept', 'year', 'level', 
      'project', 'org', 'place', 'date', 'competitions', 'fileUrls'
    ]);
  }
  
  sheet.appendRow([
    data.timestamp,
    data.recordedBy,
    data.recordedDept,
    data.year,
    data.level,
    data.project,
    data.org,
    data.place,
    data.date,
    JSON.stringify(data.competitions),
    JSON.stringify(data.fileUrls || [])
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRecord(e) {
  const data = JSON.parse(e.parameter.data);
  const rowIndex = parseInt(e.parameter.rowIndex);
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('ผลงาน');
  
  if (!sheet || rowIndex < 2) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid row' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const row = [
    data.timestamp,
    data.recordedBy,
    data.recordedDept,
    data.year,
    data.level,
    data.project,
    data.org,
    data.place,
    data.date,
    JSON.stringify(data.competitions),
    JSON.stringify(data.fileUrls || [])
  ];
  
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteRecord(e) {
  const rowIndex = parseInt(e.parameter.rowIndex);
  const fileUrlsStr = e.parameter.fileUrls;
  
  // ลบไฟล์ใน Drive
  if (fileUrlsStr) {
    try {
      const fileUrls = JSON.parse(fileUrlsStr);
      fileUrls.forEach(url => {
        try {
          // Extract file ID from Google Drive URL
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match) {
            const fileId = match[1];
            DriveApp.getFileById(fileId).setTrashed(true);
          }
        } catch (fileErr) {
          // Continue even if file deletion fails
          Logger.log('File delete error: ' + fileErr.message);
        }
      });
    } catch (parseErr) {
      Logger.log('Parse fileUrls error: ' + parseErr.message);
    }
  }
  
  // ลบแถวใน Sheet
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('ผลงาน');
  
  if (sheet && rowIndex >= 2) {
    sheet.deleteRow(rowIndex);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRecords() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('ผลงาน');
  
  if (!sheet || sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getValues();
  const records = data.map((row, i) => ({
    rowIndex: i + 2,
    timestamp: row[0],
    recordedBy: row[1],
    recordedDept: row[2],
    year: row[3],
    level: row[4],
    project: row[5],
    org: row[6],
    place: row[7],
    date: row[8],
    competitions: safeParseJSON(row[9], []),
    fileUrls: safeParseJSON(row[10], [])
  }));
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: records }))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}"""