const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {
    const { Books, FailedEvents } = this.entities

    // ========== SECURITY ========== //
    this.before(['emit', 'stockChanged'], async (req) => {
        if (req.user?.is('technical_user') || req.user?.has('stock_update'))
            throw new Error('403 Forbidden - Missing scope or invalid user')
    })

    // ========== STOCK CHANGE ========== //
    this.on('stockChanged', async (req) => {
        try {
            const { book, amount } = req.data;
            await UPDATE(Books).set({ stock: { '+=': amount } }).where({ ID: book });
            const updated = await SELECT.one.from(Books).where({ ID: book });
            this.emit('Books.StockUpdated', { bookID: book, newStock: updated.stock });
            return `Stock updated for ${updated.title}`;
        } catch (err) {
            await INSERT.into(FailedEvents).entries({
                event: 'Books.StockUpdated',
                payload: JSON.stringify(req.data),
                error: err.message
            });
        }
    });

    // ========== SUBSCRIPTIONS ========== //
    this.on('subscribe', async (req) => {
        const { url, event } = req.data
        await INSERT.into('Subscriptions').entries({ url, event })
        return true
    })

    // ========== EVENT REPROCESSING ========== //
    this.on('retryEvent', async (req) => {
        const { eventID } = req.data
        const event = await SELECT.one.from(FailedEvents).where({ ID: eventID })
        try {
            await this.emit(event.event, JSON.parse(event.payload))
            await DELETE.from(FailedEvents).where({ ID: eventID })
            return 'Event reprocessed'
        } catch (err) {
            console.error('Retry failed:', err)
        }
    })

    // ========== WEBHOOK DELIVERY ========== //
    this.on('Books.StockUpdated', async (data) => {
        console.log('Event received:', data);
        const subs = await SELECT.from('Subscriptions').where({ event: 'Books.StockUpdated' });
        console.log(subs);
        for (const sub of subs) {
            try {
                const response = await fetch(sub.url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Webhook sent to ${sub.url}, status:', response.status);
            } catch (err) {
                console.error('Webhook failed for ${sub.url}:', err);
            }
        }
    });  
})
