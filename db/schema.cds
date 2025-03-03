namespace my.catalog;

entity Books {
  key ID     : UUID;
  title      : String(100);
  stock      : Integer;
  author     : Association to Authors;
}

entity Authors {
  key ID     : UUID;
  name       : String(100);
  books      : Association to many Books on books.author = $self;
}

entity FailedEvents {
  key ID     : UUID;
  event      : String;
  payload    : LargeString;
  error      : String;
  timestamp  : Timestamp @cds.on.insert: $now;
}

entity Subscriptions {
  key ID     : UUID;
  url        : String(255);
  event      : String(100);
  createdAt  : Timestamp @cds.on.insert: $now;
}