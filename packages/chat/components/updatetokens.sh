#old array of v10 tokens
declare -a V10_TOKENS=('\$support-01')
#declare -a V10_TOKENS=('\$text-01' '\$text-02' '\$text-03' '\$ui-03' '\$ui-background' '\$ui-05' '\$support-error' '\$ui-01' '\$hover-ui' '\$interactive-01')



#new array of v11 tokens
declare -a V11_TOKENS=('\$support-error')
#declare -a V11_TOKENS=('\$text-primary' '\$text-secondary' '\$text-placeholder' '\$layer-accent-01' '\$background' '\$border-inverse' '\$support-01' '\$layer-01' '\$background-hover' '\$button-primary')

#make sure arrays align...
if [ ${#V10_TOKENS[@]} -ne ${#V11_TOKENS[@]} ]; then
	echo "Array length mismatch, old: (${#V10_TOKENS[@]}) items, new: (${#V11_TOKENS[@]}) items, aborting..."
	exit 1
fi

for (( i=0; i<${#V10_TOKENS[@]}; i++ )); do
	OLD_TOKEN=${V10_TOKENS[$i]}
	NEW_TOKEN=${V11_TOKENS[$i]}
	echo "Replacing ${OLD_TOKEN} with ${NEW_TOKEN}"
	#echo "Running: find . -type f -name '*.scss' -exec sed -i '' 's|${OLD_TOKEN}|${NEW_TOKEN}|g'"
	find . -type f -name '*.scss' -exec sed -i '' "s|${OLD_TOKEN}|${NEW_TOKEN}|g" {} +
done

echo “All .scss files updated”