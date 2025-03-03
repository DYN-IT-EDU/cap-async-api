using { my.catalog as my } from '../db/schema';

@AsyncAPI.Title: 'CatalogService Events'
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.Description: 'Events emitted by the CatalogService.'
service CatalogService {

  @(path: '/Books')
  entity Books as projection on my.Books;
  
  @(path: '/Authors')
  entity Authors as projection on my.Authors;
  
  @(path: '/FailedEvents')
  entity FailedEvents as projection on my.FailedEvents;

  @(path: '/Subscriptions')
  entity Subscriptions as projection on my.Subscriptions;

  @(path: '/stockChanged')
  action stockChanged(book: Books:ID, amount: Integer) returns String;

  @(path: '/subscribe')
  function subscribe(url: String, event: String) returns Boolean;

  @(path: '/retryEvent')
  action retryEvent(eventID: UUID) returns String;

  @AsyncAPI.EventSpecVersion: '2.0'
  @AsyncAPI.EventType: 'Books.StockUpdated.v1'
  event Books.StockUpdated : {
    bookID  : UUID;
    newStock: Integer;
  };
}