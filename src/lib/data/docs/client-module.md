```html
<!-- Include in your app -->
<script type="module">
	import { scrtLink } from 'https://secrets.levine.io/api/v1/client-module';

	// Instantiate client with API key.
	const client = scrtLink('<your-api-key>');

	client.createSecret('Some confidential information…').then(console.log);
</script>
```
