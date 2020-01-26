import React, {useState, SyntheticEvent, useEffect, createRef, ChangeEvent} from 'react';
import classNames from 'classnames';
import {useDebouncedCallback} from "use-debounce";
import getLineHeight from 'line-height';
import './textarea-list.css'

interface TextareaDescriptor {
    lineHeight: number;
}

interface TextareaListProps {
    maxRows?: number;
    presetValues?: string[];
    onCommit?: (committedItems: string[]) => void;
}

function showIfNonEmpty(container: string | any[]) {
    return {'show': (container && container.length > 0)};
}

export function TextareaList(props: TextareaListProps) {
    // I can't figure out another way to get a handle on the TextArea at 'init' after the component has mounted,
    // to auto-set the initial height of the TextArea
    const taRef = createRef<HTMLTextAreaElement>();
    const [pendingValueString, setPendingValueString] = useState<string>('');
    const [textareaDescriptor, setTextareaDescriptor] = useState<TextareaDescriptor>();

    const [debouncedResizer] = useDebouncedCallback(resizeTextArea, 200, {maxWait: 400});

    // I was kind of hoping this would cause an 'onChange' to happen, but it doesn't
    useEffect(() => {
        // anytime something outside changes our 'presetValue' update the current textarea value and then
        // resize.
        setPendingValueString((props.presetValues || []).join('\n'));
        if (taRef.current !== null) {
            debouncedResizer(taRef.current);
        }
    }, [props.presetValues]);

    function debouncedEventResizer(e: SyntheticEvent<HTMLTextAreaElement>) {
        debouncedResizer(e.currentTarget);
    }

    function fetchTextareaDescriptor(textarea: HTMLTextAreaElement) {
        let result = textareaDescriptor;
        if (!result) {
            result = calculateTextareaDescriptor(textarea);
            setTextareaDescriptor(result);
        }

        return result;
    }

    function resizeTextArea(ta: HTMLTextAreaElement) {
        const descriptor = fetchTextareaDescriptor(ta);
        ta.style.maxHeight = (props.maxRows && `${props.maxRows * descriptor.lineHeight}px`) || 'initial';
        ta.style.height = '0';
        ta.style.height = `${ta.scrollHeight}px`;
    }

    function onChangeHandler(e: ChangeEvent<HTMLTextAreaElement>) {
        setPendingValueString(e.currentTarget.value);
        debouncedEventResizer(e);
    }

    function commitHandler() {
        const toCommit = pendingValueString.split('\n');
        if (props.onCommit) {
            props.onCommit(toCommit);
        }

        setPendingValueString('');
    }

    return <div className="textarea-list">
        <textarea
            ref={taRef}
            className="textarea-list-text"
            value={pendingValueString}
            onKeyDown={debouncedEventResizer}
            onChange={onChangeHandler}
        />
        <button className={classNames('commit-button', showIfNonEmpty(pendingValueString))}
                onClick={commitHandler}>Add
        </button>
    </div>
}

export function calculateTextareaDescriptor(textArea: HTMLTextAreaElement): TextareaDescriptor {
    return {lineHeight: getLineHeight(textArea)};
}