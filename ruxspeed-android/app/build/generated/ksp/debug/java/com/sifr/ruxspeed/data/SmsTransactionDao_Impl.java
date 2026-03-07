package com.sifr.ruxspeed.data;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Integer;
import java.lang.Long;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class SmsTransactionDao_Impl implements SmsTransactionDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<SmsTransaction> __insertionAdapterOfSmsTransaction;

  private final SharedSQLiteStatement __preparedStmtOfUpdateStatus;

  public SmsTransactionDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfSmsTransaction = new EntityInsertionAdapter<SmsTransaction>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `sms_transactions` (`id`,`store_id`,`trx_id`,`amount`,`sender_number`,`provider`,`timestamp`,`status`) VALUES (nullif(?, 0),?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final SmsTransaction entity) {
        statement.bindLong(1, entity.getId());
        statement.bindString(2, entity.getStoreId());
        statement.bindString(3, entity.getTrxId());
        statement.bindDouble(4, entity.getAmount());
        if (entity.getSenderNumber() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getSenderNumber());
        }
        statement.bindString(6, entity.getProvider());
        statement.bindString(7, entity.getTimestamp());
        statement.bindString(8, entity.getStatus());
      }
    };
    this.__preparedStmtOfUpdateStatus = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE sms_transactions SET status = ? WHERE id = ?";
        return _query;
      }
    };
  }

  @Override
  public Object insert(final SmsTransaction transaction,
      final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfSmsTransaction.insertAndReturnId(transaction);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object updateStatus(final long id, final String status,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfUpdateStatus.acquire();
        int _argIndex = 1;
        _stmt.bindString(_argIndex, status);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfUpdateStatus.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object getPending(final Continuation<? super List<SmsTransaction>> $completion) {
    final String _sql = "SELECT * FROM sms_transactions WHERE status = 'pending' ORDER BY id ASC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<SmsTransaction>>() {
      @Override
      @NonNull
      public List<SmsTransaction> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfStoreId = CursorUtil.getColumnIndexOrThrow(_cursor, "store_id");
          final int _cursorIndexOfTrxId = CursorUtil.getColumnIndexOrThrow(_cursor, "trx_id");
          final int _cursorIndexOfAmount = CursorUtil.getColumnIndexOrThrow(_cursor, "amount");
          final int _cursorIndexOfSenderNumber = CursorUtil.getColumnIndexOrThrow(_cursor, "sender_number");
          final int _cursorIndexOfProvider = CursorUtil.getColumnIndexOrThrow(_cursor, "provider");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfStatus = CursorUtil.getColumnIndexOrThrow(_cursor, "status");
          final List<SmsTransaction> _result = new ArrayList<SmsTransaction>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final SmsTransaction _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpStoreId;
            _tmpStoreId = _cursor.getString(_cursorIndexOfStoreId);
            final String _tmpTrxId;
            _tmpTrxId = _cursor.getString(_cursorIndexOfTrxId);
            final double _tmpAmount;
            _tmpAmount = _cursor.getDouble(_cursorIndexOfAmount);
            final String _tmpSenderNumber;
            if (_cursor.isNull(_cursorIndexOfSenderNumber)) {
              _tmpSenderNumber = null;
            } else {
              _tmpSenderNumber = _cursor.getString(_cursorIndexOfSenderNumber);
            }
            final String _tmpProvider;
            _tmpProvider = _cursor.getString(_cursorIndexOfProvider);
            final String _tmpTimestamp;
            _tmpTimestamp = _cursor.getString(_cursorIndexOfTimestamp);
            final String _tmpStatus;
            _tmpStatus = _cursor.getString(_cursorIndexOfStatus);
            _item = new SmsTransaction(_tmpId,_tmpStoreId,_tmpTrxId,_tmpAmount,_tmpSenderNumber,_tmpProvider,_tmpTimestamp,_tmpStatus);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getPendingCount(final Continuation<? super Integer> $completion) {
    final String _sql = "SELECT COUNT(*) FROM sms_transactions WHERE status = 'pending'";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final Integer _result;
          if (_cursor.moveToFirst()) {
            final int _tmp;
            _tmp = _cursor.getInt(0);
            _result = _tmp;
          } else {
            _result = 0;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getSyncedCount(final Continuation<? super Integer> $completion) {
    final String _sql = "SELECT COUNT(*) FROM sms_transactions WHERE status = 'synced'";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final Integer _result;
          if (_cursor.moveToFirst()) {
            final int _tmp;
            _tmp = _cursor.getInt(0);
            _result = _tmp;
          } else {
            _result = 0;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getRecent(final Continuation<? super List<SmsTransaction>> $completion) {
    final String _sql = "SELECT * FROM sms_transactions ORDER BY id DESC LIMIT 20";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<SmsTransaction>>() {
      @Override
      @NonNull
      public List<SmsTransaction> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfStoreId = CursorUtil.getColumnIndexOrThrow(_cursor, "store_id");
          final int _cursorIndexOfTrxId = CursorUtil.getColumnIndexOrThrow(_cursor, "trx_id");
          final int _cursorIndexOfAmount = CursorUtil.getColumnIndexOrThrow(_cursor, "amount");
          final int _cursorIndexOfSenderNumber = CursorUtil.getColumnIndexOrThrow(_cursor, "sender_number");
          final int _cursorIndexOfProvider = CursorUtil.getColumnIndexOrThrow(_cursor, "provider");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfStatus = CursorUtil.getColumnIndexOrThrow(_cursor, "status");
          final List<SmsTransaction> _result = new ArrayList<SmsTransaction>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final SmsTransaction _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpStoreId;
            _tmpStoreId = _cursor.getString(_cursorIndexOfStoreId);
            final String _tmpTrxId;
            _tmpTrxId = _cursor.getString(_cursorIndexOfTrxId);
            final double _tmpAmount;
            _tmpAmount = _cursor.getDouble(_cursorIndexOfAmount);
            final String _tmpSenderNumber;
            if (_cursor.isNull(_cursorIndexOfSenderNumber)) {
              _tmpSenderNumber = null;
            } else {
              _tmpSenderNumber = _cursor.getString(_cursorIndexOfSenderNumber);
            }
            final String _tmpProvider;
            _tmpProvider = _cursor.getString(_cursorIndexOfProvider);
            final String _tmpTimestamp;
            _tmpTimestamp = _cursor.getString(_cursorIndexOfTimestamp);
            final String _tmpStatus;
            _tmpStatus = _cursor.getString(_cursorIndexOfStatus);
            _item = new SmsTransaction(_tmpId,_tmpStoreId,_tmpTrxId,_tmpAmount,_tmpSenderNumber,_tmpProvider,_tmpTimestamp,_tmpStatus);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
