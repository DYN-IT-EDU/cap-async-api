# Generation of Event Specification Files

## Service Definition with Annotations
To generate an AsyncAPI specification, annotations must be added to the service and events:

```cds
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.Description: 'Events emitted by the CatalogService.'
service CatalogService {
  @AsyncAPI.EventSpecVersion: '2.0'
  @AsyncAPI.EventType: 'Books.StockUpdated'
  event Books.StockUpdated : {
    bookID  : UUID;
    newStock: Integer;
  };
}
```

## Configuration for Exporting AsyncAPI Specification

The configuration for exporting the AsyncAPI specification is set in `.cdsrc.json`:

```json
{
  "export": {
    "asyncapi": {
      "application_namespace": "my.catalog",
      "merged": {
        "title": "Catalog Service Events",
        "version": "1.0.0",
        "description": "AsyncAPI specification for CatalogService"
      }
    }
  }
}
```

## Command to Generate AsyncAPI File

To generate the AsyncAPI specification file, run the following command:

```sh
cds compile srv --service all -o docs --to asyncapi --asyncapi:merged
```

### Output
After executing the command `srv.json` file will be created in the `docs` folder.

## Additional References
[CAP AsyncAPI Documentation](https://cap.cloud.sap/docs/advanced/publishing-apis/asyncapi)

# API without broker 

## Subscribing to an Event

In this code, the API does not depend on the broker. Instead, events and data are transmitted directly through event calls and subscriptions. The `this.emit()` method allows you to send an event `Books.Stock Updated`, and the handler `this.on('Books.StockUpdated')` performs actions based on the received data (sending webhooks).

Generate an url on website [webhook](https://webhook.site/) to run tests.
Replace url with yours in test requests.

```bash
curl -v -u technical_user:secret \
  -X GET "http://localhost:4004/odata/v4/catalog/subscribe(url='https://webhook.site/16adf145-da55-40e3-b662-37409c6f1a99',event='Books.StockUpdated')"
```

## Triggering the Event

```bash
curl -v -u technical_user:secret \
  -X POST "http://localhost:4004/odata/v4/catalog/stockChanged" \
  -H "Content-Type: application/json" \
  -d '{"book": "f8d9f7b0-8569-11ed-9d6a-0800200c9a66", "amount": 5}'
```

# Event Reprocessing Techniques

The code implements the logic of event reprocessing via the `retryEvent` event. If the event failed, the failure information is stored in the `FailedEvents` table. To reprocess the event, you can use the `retryEvent` event, which retrieves the erroneous event from the `FailedEvents` table, tries to perform the operation again, and if the operation is successful, deletes the event record from the table.

```bash
curl -u technical_user:secret \
  -X POST "http://localhost:4004/odata/v4/catalog/retryEvent" \
  -H "Content-Type: application/json" \
  -d '{"eventID": "d245f878-0033-4af4-adf9-b51c8dc3caa4"}'
```

